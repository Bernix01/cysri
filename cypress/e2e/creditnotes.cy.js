Cypress.on("uncaught:exception", (err, runnable) => {
  // returning false here prevents Cypress from
  // failing the test
  return false;
});

const downloadsFolder = Cypress.config("downloadsFolder");
const year = "2024";
const startMonth = 0; // 0 based

describe("download the year xml", () => {
  beforeEach(() => {
    cy.login(Cypress.env("USER"), Cypress.env("PASS"));
    cy.visit("/sri-en-linea/contribuyente/perfil");
    cy.wait(1000 + Math.random() * 2000);
    cy.get(".tamano-icono-hamburguesa").click();
    cy.wait(1000 + Math.random() * 2000);
    cy.get(
      ":nth-child(5) > .ui-widget > .ui-panelmenu-header-link > .ui-menuitem-text"
    ).click();
    cy.get(
      ":nth-child(5) > .ui-panelmenu-content-wrapper > .ui-panelmenu-content > .ui-panelmenu-root-submenu > :nth-child(1) > :nth-child(2) > .ui-menuitem-link > .ui-menuitem-text"
    ).click();
    cy.wait(1000 + Math.random() * 2000);
    cy.location("pathname", { timeout: 180000 }).should(
      "contain",
      "/comprobantes-electronicos-internet/pages/consultas/recibidos"
    );
  });

  it("download all credit notes", async function () {
    const docType = "3";
    cy.wrap(Array(12)).as("months");
    cy.get("@months").each((month, monthIndex, $list) => {
      if (
        monthIndex < startMonth ||
        (monthIndex > new Date().getMonth() &&
          parseInt(year) === new Date().getFullYear())
      ) {
        return;
      }
      cy.get("#id-sri-splash", { timeout: 10000 }).should("not.exist");
      cy.wait(3000 + Math.random() * 7000);

      // trying to create random scroll
      cy.scrollTo("bottom", { ensureScrollable: false });
      cy.wait(500 + Math.random() * 500);
      cy.scrollTo("top", { ensureScrollable: false });
      cy.wait(500 + Math.random() * 500);

      cy.get("#frmPrincipal\\:ano").select(year);
      cy.wait(200 + Math.random() * 700);
      cy.get("#frmPrincipal\\:mes").select(`${monthIndex + 1}`); // month is 0 based
      cy.wait(200 + Math.random() * 700);
      cy.get("#frmPrincipal\\:dia").select("0"); // all days
      cy.wait(500 + Math.random() * 700);
      cy.get("#frmPrincipal\\:ano").select(year);
      cy.wait(200 + Math.random() * 700);
      cy.get("#frmPrincipal\\:mes").select(`${monthIndex + 1}`); // month is 0 based
      cy.wait(200 + Math.random() * 700);
      cy.get("#frmPrincipal\\:dia").select("0"); // all days
      cy.wait(500 + Math.random() * 700);
      cy.get("#frmPrincipal\\:cmbTipoComprobante").select(docType);
      cy.wait(200 + Math.random() * 700);

      cy.log("searching");
      cy.get("#btnRecaptcha").click();
      cy.log("waiting for captcha");
      cy.get("#frmPrincipal\\:tablaCompRecibidos_paginator_bottom", {
        timeout: 180000, // so you can complete captcha if asked to
      }).should("be.visible");
      cy.log("captcha passed");

      // revalidation
      cy.get("#frmPrincipal\\:ano").should("have.value", year);
      cy.get("#frmPrincipal\\:mes").should("have.value", `${monthIndex + 1}`);
      cy.get("#frmPrincipal\\:dia").should("have.value", "0");
      cy.get(
        "#frmPrincipal\\:tablaCompRecibidos_paginator_bottom > .ui-paginator-rpp-options"
      ).select("75");
      cy.wait(1000 + Math.random() * 1000);
      cy.scrollTo("bottom", { ensureScrollable: false });

      cy.get(
        "#frmPrincipal\\:tablaCompRecibidos_paginator_bottom > .ui-paginator-current"
      ).then((value) => {
        const availablePages = value.text();
        // regex filter to get the numbers in "(1 of 1)"
        const pages = availablePages.match(/\d+/g).map(Number);
        cy.wrap(Array(pages[1])).as("pages");
      });

      cy.get("@pages").each((page, pageIndex, $list) => {
        // for each available page
        cy.log(`page ${pageIndex} of ${$list.length - 1}`);
        cy.get("#frmPrincipal\\:tablaCompRecibidos_data")
          .find("tr")
          .each(($el, index, $list) => {
            // get invoice number
            cy.get(`tr:nth-child(${index + 1}) > td:nth-child(3) > div`, {
              log: false,
            }).then(($el) => {
              const text = $el.text().trim().replace(/\s+/g, "_");
              cy.wrap(text).as(`invoiceNumber`);
            });

            cy.get("@invoiceNumber", { log: false }).then((invoiceNumber) => {
              // check if file exists
              cy.exec(
                `[ -f ${downloadsFolder}/${monthIndex}-${invoiceNumber}.xml ] && echo "file exists"`,
                { failOnNonZeroExit: false, log: false }
              ).then((stdout) => {
                const exists = stdout.stdout === "file exists";
                cy.wrap(exists).as(`fileExists`);
              });

              //process row
              cy.get(`@fileExists`, { log: false }).then((exists) => {
                if (!exists) {
                  cy.get(
                    `#frmPrincipal\\:tablaCompRecibidos\\:${
                      75 * pageIndex + index
                    }\\:lnkXml`
                  ).click();
                  cy.fsRename({
                    newPath: `${downloadsFolder}/${monthIndex}-${invoiceNumber}.xml`,
                    path: `${downloadsFolder}/Notas de_`,
                  });
                }
              });
            });
          });

        // go to next page, if available
        if ($list.length - 1 !== pageIndex) {
          cy.get(
            "#frmPrincipal\\:tablaCompRecibidos_paginator_bottom > .ui-paginator-next"
          ).click();
          cy.wait(5000);
        }
      });
    });
  });
});
