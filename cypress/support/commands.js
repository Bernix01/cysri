// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
Cypress.Commands.add("login", (email, password) => {
  cy.session(
    [email, password],
    () => {
      cy.visit("/sri-en-linea/inicio/NAT");
      cy.get("#id-sri-splash", { timeout: 10000 }).should("not.exist");
      cy.wait(1000 + Math.random() * 3000);
      cy.get(".sri-splash", { timeout: 30000 }).should("not.be.visible");
      cy.get(".sri-tamano-link-iniciar-sesion").click();
      cy.get("#id-sri-splash", { timeout: 10000 }).should("not.exist");
      cy.get("#usuario", { timeout: 30000 }).should("be.visible");
      cy.get("#password", { timeout: 30000 }).should("be.visible");
      cy.get("#usuario").type(email);
      cy.get("#password").type(password);
      cy.get("#kc-login").click();
      cy.get("#id-sri-splash", { timeout: 10000 }).should("not.exist");
      cy.wait(1000 + Math.random() * 3000);
      cy.get(".sri-splash", { timeout: 30000 }).should("not.be.visible");
      cy.location("pathname").should(
        "eq",
        "/sri-en-linea/contribuyente/perfil"
      );
    },
    {
      cacheAcrossSpecs: true,
      validate: () => {
        cy.visit("/sri-en-linea/contribuyente/perfil");
        cy.get(".titulo-perfil").should("be.visible");
        cy.get(".titulo-perfil").should("have.text", email);
        cy.location("pathname").should(
          "eq",
          "/sri-en-linea/contribuyente/perfil"
        );
      },
    }
  );
});

//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })
