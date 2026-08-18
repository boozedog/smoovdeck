import { Match as M, Schema as S } from 'effect'
import { Command, Runtime } from 'foldkit'
import { evo } from 'foldkit/struct'

import {
  Stage,
  SelectedCell,
  Workspace,
  dummyTranscriptLine,
  dummyWorkspaces,
  updateStageCell,
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

export const UpdatePromptDraft = S.Struct({
  _tag: S.Literal('UpdatePromptDraft'),
  value: S.String,
})

export const SubmitPrompt = S.Struct({
  _tag: S.Literal('SubmitPrompt'),
})

export const AbortPrompt = S.Struct({
  _tag: S.Literal('AbortPrompt'),
})

export const Message = S.Union([
  ToggleSidebar,
  SelectCell,
  UpdatePromptDraft,
  SubmitPrompt,
  AbortPrompt,
])
export type Message = typeof Message.Type

export const init: Runtime.ApplicationInit<Model, Message> = () => [
  {
    collapsed: false,
    workspaces: [...dummyWorkspaces],
    selectedCell: undefined,
  },
  [],
]

const withSelectedCell = (
  model: Model,
  apply: (
    workspaceId: string,
    stage: SelectedCell['stage'],
  ) => ReadonlyArray<Workspace>,
): Model => {
  const selectedCell = model.selectedCell
  if (selectedCell === undefined) {
    return model
  }
  return evo(model, {
    workspaces: () =>
      apply(selectedCell.workspaceId, selectedCell.stage),
  })
}

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
      UpdatePromptDraft: ({ value }) => [
        withSelectedCell(model, (workspaceId, stage) =>
          updateStageCell(model.workspaces, workspaceId, stage, cell => ({
            ...cell,
            promptDraft: value,
          })),
        ),
        [],
      ],
      SubmitPrompt: () => [
        withSelectedCell(model, (workspaceId, stage) =>
          updateStageCell(model.workspaces, workspaceId, stage, cell => {
            if (cell.promptDraft.trim().length === 0) {
              return cell
            }
            return {
              ...cell,
              status: 'pending',
              transcript: [...cell.transcript, dummyTranscriptLine],
            }
          }),
        ),
        [],
      ],
      AbortPrompt: () => [
        withSelectedCell(model, (workspaceId, stage) =>
          updateStageCell(model.workspaces, workspaceId, stage, cell => {
            if (cell.status !== 'pending') {
              return cell
            }
            return {
              ...cell,
              status: 'idle',
            }
          }),
        ),
        [],
      ],
    }),
  )
