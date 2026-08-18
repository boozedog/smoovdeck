import { Match as M, Schema as S } from 'effect'
import { Command, Runtime } from 'foldkit'
import { evo } from 'foldkit/struct'

import {
  Stage,
  SelectedCell,
  Workspace,
  dummyWorkspaces,
} from './board'

export const Model = S.Struct({
  collapsed: S.Boolean,
  workspaces: S.Array(Workspace),
  selectedCell: S.optional(SelectedCell),
})
export type Model = typeof Model.Type

export const ToggleSidebar = S.Struct({
  _tag: S.Literal('ToggleSidebar'),
})

export const SelectCell = S.Struct({
  _tag: S.Literal('SelectCell'),
  workspaceId: S.String,
  stage: Stage,
})

export const Message = S.Union([ToggleSidebar, SelectCell])
export type Message = typeof Message.Type

export const init: Runtime.ApplicationInit<Model, Message> = () => [
  {
    collapsed: false,
    workspaces: [...dummyWorkspaces],
    selectedCell: undefined,
  },
  [],
]

export const update = (
  model: Model,
  message: Message,
): readonly [Model, ReadonlyArray<Command.Command<Message>>] =>
  M.value(message).pipe(
    M.withReturnType<
      readonly [Model, ReadonlyArray<Command.Command<Message>>]
    >(),
    M.tagsExhaustive({
      ToggleSidebar: () => [
        evo(model, { collapsed: collapsed => !collapsed }),
        [],
      ],
      SelectCell: ({ workspaceId, stage }) => [
        evo(model, { selectedCell: () => ({ workspaceId, stage }) }),
        [],
      ],
    }),
  )
