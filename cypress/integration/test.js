describe('My First Test', function() {


  it('Home Page', function() {
    cy.visit('/');
  });
  it('Basic Example', function() {
    cy.visit('examples/basic.html');
  });
})
