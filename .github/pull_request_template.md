name: Pull Request
description: Submit a pull request to DevMentor AI
title: "[PR]: "
labels: ["needs-review"]
assignees: []

body:
  - type: markdown
    attributes:
      value: |
        Thanks for contributing to DevMentor AI! 🚀
        
        Please provide as much detail as possible about your changes.

  - type: textarea
    id: description
    attributes:
      label: Description
      description: A clear and concise description of what this PR does
      placeholder: Describe your changes...
    validations:
      required: true

  - type: textarea
    id: changes
    attributes:
      label: Changes Made
      description: List the specific changes made in this PR
      placeholder: |
        - Added new feature X
        - Fixed bug Y
        - Updated documentation Z
    validations:
      required: true

  - type: dropdown
    id: type
    attributes:
      label: Type of Change
      description: What type of change does this PR introduce?
      options:
        - 🐛 Bug fix (non-breaking change which fixes an issue)
        - ✨ New feature (non-breaking change which adds functionality)
        - 💥 Breaking change (fix or feature that would cause existing functionality to not work as expected)
        - 📚 Documentation update
        - 🎨 Code style update (formatting, renaming)
        - ♻️ Refactoring (no functional changes)
        - ⚡ Performance improvement
        - 🧪 Test update
        - 🔧 Build/CI changes
    validations:
      required: true

  - type: checkboxes
    id: checklist
    attributes:
      label: Checklist
      description: Please check all that apply
      options:
        - label: My code follows the project's style guidelines
          required: true
        - label: I have performed a self-review of my own code
          required: true
        - label: I have commented my code, particularly in hard-to-understand areas
          required: true
        - label: I have made corresponding changes to the documentation
          required: true
        - label: My changes generate no new warnings
          required: true
        - label: I have added tests that prove my fix is effective or that my feature works
          required: true
        - label: New and existing unit tests pass locally with my changes
          required: true

  - type: textarea
    id: testing
    attributes:
      label: Testing
      description: How have you tested these changes?
      placeholder: |
        - [ ] Tested on Chrome Canary 127+
        - [ ] Tested with AI flags enabled
        - [ ] Tested on multiple websites (GitHub, Stack Overflow, etc.)
        - [ ] Tested error scenarios
        - [ ] Tested performance impact

  - type: textarea
    id: screenshots
    attributes:
      label: Screenshots/Videos
      description: If applicable, add screenshots or videos to demonstrate your changes
      placeholder: Drag and drop media here...

  - type: textarea
    id: additional-context
    attributes:
      label: Additional Context
      description: Add any other context about the pull request here
      placeholder: Any additional information...

  - type: checkboxes
    id: terms
    attributes:
      label: Code of Conduct
      description: By submitting this PR, you agree to follow our Code of Conduct
      options:
        - label: I agree to follow this project's Code of Conduct
          required: true


