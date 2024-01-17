Cypress.on("uncaught:exception", (err, runnable) => {
  // returning false here prevents Cypress from
  // failing the test
  return false;
});

const downloadsFolder = Cypress.config("downloadsFolder");
// month is 1 based
const month = "1";
const year = "2023";
// 0 is all - 1 is invoices - 2 is credit notes
const docType = "1";
describe("invoice download xml", () => {
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

  it("jan", async function () {
    cy.get("#id-sri-splash", { timeout: 10000 }).should("not.exist");
    cy.wait(3000 + Math.random() * 7000);

    // trying to create random scroll
    cy.scrollTo("bottom", { ensureScrollable: false });
    cy.wait(500 + Math.random() * 500);
    cy.scrollTo("top", { ensureScrollable: false });
    cy.wait(500 + Math.random() * 500);

    cy.get("#frmPrincipal\\:ano").select(year);
    cy.wait(200 + Math.random() * 700);
    cy.get("#frmPrincipal\\:mes").select(month);
    cy.wait(200 + Math.random() * 700);
    cy.get("#frmPrincipal\\:dia").select("0"); // all days
    cy.wait(200 + Math.random() * 700);
    cy.get("#frmPrincipal\\:cmbTipoComprobante").select(docType);
    cy.wait(200 + Math.random() * 700);

    cy.log("searching");
    cy.get("#btnRecaptcha").click();
    cy.log("waiting for captcha");
    cy.get("#frmPrincipal\\:tablaCompRecibidos_paginator_bottom", {
      timeout: 180000, // so you can complete captcha if asked to
    }).should("be.visible");
    cy.log("captcha passed");

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
      cy.wrap(pages).as("pages");
    });

    cy.get("#frmPrincipal\\:tablaCompRecibidos_data")
      .find("tr")
      .each(($el, index, $list) => {
        cy.exec(`[ -f ${downloadsFolder}/Factura-${year}-${month}-${index}.xml ] && echo "file exists"`, {failOnNonZeroExit: false}).then((stdout) => {
          const exists = stdout.stdout === "file exists";
          cy.wrap(exists).as(`fileExists${index}`);
        });
        // fileExists(
        //   `${downloadsFolder}/Factura-${year}-${month}-${index}.xml`,
        //   index
        // );
        cy.get(`@fileExists${index}`).then((exists) => {
          if (!exists) {
            cy.get(
              `#frmPrincipal\\:tablaCompRecibidos\\:${index}\\:lnkXml`
            ).click();
            cy.readFile(`${downloadsFolder}/Factura.xml`).should("exist");
            cy.fsRename({
              newPath: `${downloadsFolder}/Factura-${year}-${month}-${index}.xml`,
              path: `${downloadsFolder}/Factura.xml`,
            });
          }
        });
      });
    // });
    // });
  });
});

function fileExists(filePath, index) {
  cy.fsFileExists(filePath).then((exists) => {
    cy.wrap(exists).as(`fileExists${index}`);
  });
}
