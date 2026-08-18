import { describe, expect, it } from '@effect/vitest'
import * as Scene from 'foldkit/scene'

import { dummyTranscriptLine } from './board'
import { focusedPromptInput } from './focused'
import { view } from './main'
import { init, update } from './model'

const firstBoardCell = Scene.first(Scene.all.selector('tbody button'))
const promptButton = Scene.role('button', { name: 'Prompt' })
const abortButton = Scene.role('button', { name: 'Abort' })
const promptInput = Scene.selector(`#${focusedPromptInput}`)

describe('shell model', () => {
  it('starts with the sidebar expanded', () => {
    const [model] = init()
    expect(model.collapsed).toBe(false)
  })

  it('toggles the sidebar', () => {
    const [initial] = init()
    const [collapsed] = update(initial, { _tag: 'ToggleSidebar' })
    expect(collapsed.collapsed).toBe(true)
    const [expanded] = update(collapsed, { _tag: 'ToggleSidebar' })
    expect(expanded.collapsed).toBe(false)
  })

  it('starts with two dummy workspaces', () => {
    const [model] = init()
    expect(model.workspaces.length).toBe(2)
    expect(model.workspaces[0]?.label).toBe('local-a')
    expect(model.workspaces[1]?.label).toBe('local-b')
  })

  it('selects a board cell', () => {
    const [initial] = init()
    const [selected] = update(initial, {
      _tag: 'SelectCell',
      workspaceId: 'local-a',
      stage: 'research',
    })
    expect(selected.selectedCell).toEqual({
      workspaceId: 'local-a',
      stage: 'research',
    })
  })

  it('updates the prompt draft for the selected cell', () => {
    const [initial] = init()
    const [selected] = update(initial, {
      _tag: 'SelectCell',
      workspaceId: 'local-a',
      stage: 'research',
    })
    const [drafted] = update(selected, {
      _tag: 'UpdatePromptDraft',
      value: 'ship it',
    })
    expect(drafted.workspaces[0]?.cells.research.promptDraft).toBe('ship it')
  })

  it('submits a prompt into pending with a dummy transcript line', () => {
    const [initial] = init()
    const [selected] = update(initial, {
      _tag: 'SelectCell',
      workspaceId: 'local-a',
      stage: 'research',
    })
    const [drafted] = update(selected, {
      _tag: 'UpdatePromptDraft',
      value: 'ship it',
    })
    const [pending] = update(drafted, { _tag: 'SubmitPrompt' })
    const cell = pending.workspaces[0]?.cells.research
    expect(cell?.status).toBe('pending')
    expect(cell?.transcript).toEqual([dummyTranscriptLine])
  })

  it('aborts a pending session back to idle', () => {
    const [initial] = init()
    const [selected] = update(initial, {
      _tag: 'SelectCell',
      workspaceId: 'local-a',
      stage: 'research',
    })
    const [drafted] = update(selected, {
      _tag: 'UpdatePromptDraft',
      value: 'ship it',
    })
    const [pending] = update(drafted, { _tag: 'SubmitPrompt' })
    const [aborted] = update(pending, { _tag: 'AbortPrompt' })
    expect(aborted.workspaces[0]?.cells.research.status).toBe('idle')
  })
})

describe('board scene', () => {
  it('renders stage columns and selects a cell with aria-pressed', () => {
    const [model] = init()
    Scene.scene(
      { update, view },
      Scene.given(model),
      Scene.expect(Scene.text('research')).toExist(),
      Scene.expect(Scene.text('impl')).toExist(),
      Scene.expect(Scene.text('review')).toExist(),
      Scene.expect(Scene.text('git')).toExist(),
      Scene.expect(Scene.text('fish')).toExist(),
      Scene.expect(Scene.text('local-a')).toExist(),
      Scene.expect(Scene.text('local-b')).toExist(),
      Scene.click(firstBoardCell),
      Scene.expectHandled(),
      Scene.expect(firstBoardCell).toHaveAttr('aria-pressed', 'true'),
      Scene.expect(Scene.text('Board · local-a · research')).toExist(),
    )
  })

  it('still toggles the sidebar after board interaction', () => {
    const [model] = init()
    Scene.scene(
      { update, view },
      Scene.given(model),
      Scene.click(Scene.role('button', { name: 'Collapse sidebar' })),
      Scene.expectHandled(),
      Scene.click(Scene.role('button', { name: 'Expand sidebar' })),
      Scene.expectHandled(),
    )
  })
})

describe('focused session scene', () => {
  it('shows an empty state before a cell is selected', () => {
    const [model] = init()
    Scene.scene(
      { update, view },
      Scene.given(model),
      Scene.expect(Scene.text('No cell selected')).toExist(),
      Scene.expect(Scene.text('Select a board cell to focus a session.')).toExist(),
    )
  })

  it('prompts, shows pending, and gates abort', () => {
    const [model] = init()
    Scene.scene(
      { update, view },
      Scene.given(model),
      Scene.click(firstBoardCell),
      Scene.expectHandled(),
      Scene.expect(Scene.text('local-a · research')).toExist(),
      Scene.expect(Scene.text('grok · idle')).toExist(),
      Scene.expect(Scene.text('(empty transcript)')).toExist(),
      Scene.expect(promptButton).toBeDisabled(),
      Scene.expect(abortButton).toBeDisabled(),
      Scene.type(promptInput, 'ship it'),
      Scene.expectHandled(),
      Scene.expect(promptButton).toBeEnabled(),
      Scene.expect(abortButton).toBeDisabled(),
      Scene.click(promptButton),
      Scene.expectHandled(),
      Scene.expect(Scene.text('pending')).toExist(),
      Scene.expect(Scene.text(dummyTranscriptLine)).toExist(),
      Scene.expect(abortButton).toBeEnabled(),
      Scene.click(abortButton),
      Scene.expectHandled(),
      Scene.expect(Scene.text('grok · idle')).toExist(),
      Scene.expect(abortButton).toBeDisabled(),
    )
  })
})
