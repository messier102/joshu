This is a living specification of the Joshu development workflow. It may evolve over time to better suit the project's needs.

## Features

The basic unit of development is a _feature_. A feature is broadly defined as any change or set of changes to the project that serve a single common purpose. Examples of features include:

-   new functionality
-   bug fixes
-   documentation
-   organizational changes

## Stage 1: Feature proposal

To propose a feature, open a new issue in the project repository. Describe the feature in sufficient detail. There is no rigid structure; some features may require RFC-grade documents, while others can be sufficiently explained in a couple of sentences - use whatever feels right. To help start you off, consider using the following guidelines:

### Proposing new features

Explain what the feature should do and why it should be implemented. Describe the ways it can be achieved and their tradeoffs. Consider the drawbacks of implementing the feature, and mention alternatives if they exist.

### Reporting bugs

Describe the behavior that you expected to see versus the actual behavior you observed. List the minimal set of steps to reproduce that behaviors. Mention any informed guesses you may have about the source of the issue.

## Stage 2: Triage

After an issue has been opened, it will go through the triage process. Relevant labels will be applied. Duplicate issues will be closed.

## Stage 3: Evaluation

The proposed feature will first be evaluated for implementation. Consideration is given to aspects like:

-   Does the feature align with the project's goals?
-   What is required to implement the feature? How difficult will it be?
-   Are there any alternative options better suited for the project?
-   What are the TBDs of the proposal? Is more information required to make a decision?

When the proposal is sufficiently understood, it is given a verdict: it may be accepted for implementation, declined, postponed, etc. For complex features, a progress checklist may be added to the issue's body.

## Stage 4: Implementation

The implementation process follows the [GitHub flow][0]. A new branch for a specific feature is created from the `master` branch. (The name of the branch must be in the form `issue#-short-feature-description`, for example: `53-add-logging`.) There, all the relevant development is performed. Once the feature implementation is complete, it is submitted for review via a pull request back into `master`.

## Stage 5: Review

The completed feature is reviewed prior to release to make sure there are no glaring flaws. If necessary, the implementation is tweaked. When the implementation is deemed acceptable (and it passes all CI checks), it is merged into master, and its tracking issue is marked as completed.

## Stage 6: Deployment

Upon merging a feature, the code in `master` is automatically checked, built and deployed into production.

[0]: https://guides.github.com/introduction/flow/
