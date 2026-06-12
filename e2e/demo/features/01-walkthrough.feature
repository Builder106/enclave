Feature: Workbench walkthrough

  Scenario: Run a specimen in the cloud, then keep it on-device
    Given I open the workbench
    And I pause to read
    When I select the "Groq" extractor
    And I run the extraction
    Then the structured record appears
    And I dwell on the result
    When I select the "Local" extractor
    And I run the extraction
    Then the structured record appears
    And I dwell on the result
