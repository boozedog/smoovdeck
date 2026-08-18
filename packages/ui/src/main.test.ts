import { describe, expect, it } from '@effect/vitest'
import * as Scene from 'foldkit/scene'

import { view } from './main'
import { init, update } from './model'

const firstBoardCell = Scene.first(Scene.all.selector('tbody button'))

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
