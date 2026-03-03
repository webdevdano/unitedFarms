describe("Farms flows", () => {
  it("searches farms and renders results (stubbed)", () => {
    cy.intercept("GET", "/api/user-farms", { statusCode: 200, body: [] });
    cy.intercept("GET", /\/api\/farms\?.*/, {
      statusCode: 200,
      body: [
        {
          _id: "abc123",
          MarketName: "Stub Farm",
          Address: "123 Main St",
          City: "Chico",
          Zip: "95928",
          Phone: "",
          FarmType: "Other",
          Description: "",
          Lat: 39.7285,
          Lng: -121.8375,
        },
      ],
    });

    cy.visit("/");

    cy.get('input[placeholder*="Search by city"]').type("95928");
    cy.contains("button", "Search").click();

    cy.contains("Stub Farm").should("be.visible");
    cy.contains("123 Main St").should("be.visible");
  });

  it("adds a farm via modal (stubbed POST)", () => {
    cy.intercept("GET", "/api/user-farms", { statusCode: 200, body: [] });
    cy.intercept("POST", "/api/add-farm", {
      statusCode: 201,
      body: {
        _id: "new1",
        name: "Cypress Test Farm",
        address: "1 Cypress Way",
        city: "Testville",
        state: "CA",
        zip: "90001",
        phone: "",
        farmType: "Other",
        description: "",
      },
    }).as("addFarm");

    cy.visit("/");

    cy.contains("button", "Add Farm").scrollIntoView().click();

    cy.contains("h3", "Add a New Farm")
      .parents("div.relative")
      .first()
      .within(() => {
        cy.get('input[placeholder="Farm Name"]').type("Cypress Test Farm");
        cy.get('input[placeholder="Address"]').type("1 Cypress Way");
        cy.get('input[placeholder="City"]').type("Testville");
        cy.get('input[placeholder="State"]').type("CA");
        cy.get('input[placeholder="Zip Code"]').type("90001");

        cy.contains("button", "Add Farm").click();
      });

    cy.wait("@addFarm");
    cy.contains("Cypress Test Farm").should("be.visible");
  });
});
