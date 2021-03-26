const core = require('@actions/core')
const {context} = require('@actions/github')
const match = require('./match')

function run() {
  try {
    const pr = context.payload.pull_request || {}
    const labels = pr.labels || []
    const labelNames = labels.map(label => label.name)
    core.debug(`pull request has ${labelNames.length} labels:`)
    labelNames.forEach(ln => core.debug(`label [${ln}]`))
    const allowedLabels = match.parseAllowed(core.getInput('allowed'))
    core.debug(`allowed labels:`)
    allowedLabels.forEach(al => core.debug(`label [${al}]`))
    const allowedMultipleLabels = match.parseAllowed(
      core.getInput('allowed_multiple')
    )
    let matchingLabel
    if (allowedLabels.length > 0) {
      matchingLabel = match.findMatching(labelNames, allowedLabels, false)
      core.debug(`found matching label (allowed branch): ${matchingLabel}`)
    } else if (allowedMultipleLabels.length > 0) {
      matchingLabel = match.findMatching(
        labelNames,
        allowedMultipleLabels,
        true
      )
      core.debug(`found matching label (allowed allowed_multiple): ${matchingLabel}`)
    } else {
      return core.setFailed(
        'You must provide either `allowed` or `allowed_multiple` as input.'
      )
    }

    core.setOutput('match', matchingLabel.join(', '))
  } catch (error) {
    core.setFailed(error.message)
  }
}

run()
