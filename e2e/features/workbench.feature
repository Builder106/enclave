Feature: Workbench extraction

  The intake workbench runs a chosen extractor over a specimen and shows,
  per run, whether the document's bytes stayed on-device or crossed the wire.

  Background:
    Given I open the workbench

  Scenario: On-device extraction keeps the specimen sealed
    When I select the "Local" extractor
    And I run the extraction
    Then the structured record appears
    And the specimen stays on-device
    And the egress reads "0 B"

  Scenario: Cloud extraction transmits the specimen off-site
    When I select the "Groq" extractor
    And I run the extraction
    Then the structured record appears
    And the specimen is transmitted off-site

  Scenario: The rules baseline runs with no model and no egress
    When I select the "Rules" extractor
    And I run the extraction
    Then the structured record appears
    And the egress reads "0 B"

  Scenario: Switching extractor clears the previous result
    When I select the "Groq" extractor
    And I run the extraction
    Then the structured record appears
    When I select the "Local" extractor
    Then the bench is idle again
