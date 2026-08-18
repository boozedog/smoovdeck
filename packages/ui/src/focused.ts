import type { HtmlBuilder } from 'foldkit/html'

import {
  Badge,
  Button,
  Card,
  EmptyState,
  Input,
  Row,
  Stack,
  Text,
} from '@foldstryx/foldkit'

import {
  type SelectedCell,
  type StageCell,
  type Workspace,
  findWorkspace,
} from './board.js'
import type { Message as AppMessage } from './model.js'

const FOCUSED_PROMPT_ID = 'focused-prompt'

export const view = (
  config: Readonly<{
    workspaces: ReadonlyArray<Workspace>
    selectedCell: SelectedCell | undefined
    onUpdatePromptDraft: (value: string) => AppMessage
    onSubmitPrompt: AppMessage
    onAbortPrompt: AppMessage
  }>,
  h: HtmlBuilder<AppMessage>,
) => {
  if (config.selectedCell === undefined) {
    return EmptyState.view(
      {
        title: 'No cell selected',
        message: 'Select a board cell to focus a session.',
        card: true,
      },
      h,
    )
  }

  const workspace = findWorkspace(
    config.workspaces,
    config.selectedCell.workspaceId,
  )
  const cell: StageCell | undefined =
    workspace?.cells[config.selectedCell.stage]

  if (workspace === undefined || cell === undefined) {
    return EmptyState.view(
      {
        title: 'Cell unavailable',
        message: 'The selected board cell could not be loaded.',
        card: true,
      },
      h,
    )
  }

  const transcriptNode =
    cell.transcript.length === 0
      ? Text.view(
          {
            variant: 'mutedSm',
            children: '(empty transcript)',
          },
          h,
        )
      : Text.view(
          {
            variant: 'mono',
            children: cell.transcript.join('\n'),
          },
          h,
        )

  return Card.section(
    {
      padded: true,
      title: `${workspace.label} · ${config.selectedCell.stage}`,
      description: `${cell.provider} · ${cell.status}`,
      children: [
        Stack.view(
          {
            gap: 'md',
            children: [
              Row.view(
                {
                  align: 'wrap',
                  children: [
                    Badge.view(
                      {
                        label: cell.status,
                        variant: cell.status === 'pending' ? 'info' : 'secondary',
                      },
                      h,
                    ),
                    Text.view(
                      {
                        variant: 'mutedSm',
                        children: cell.provider,
                      },
                      h,
                    ),
                  ],
                },
                h,
              ),
              Stack.view(
                {
                  gap: 'xs',
                  children: [transcriptNode],
                },
                h,
              ),
              Input.view(
                {
                  id: FOCUSED_PROMPT_ID,
                  label: 'Prompt',
                  value: cell.promptDraft,
                  placeholder: 'Draft a prompt for this cell…',
                  width: 'full',
                  onInput: config.onUpdatePromptDraft,
                },
                h,
              ),
              Row.view(
                {
                  align: 'wrap',
                  children: [
                    Button.view(
                      {
                        label: 'Prompt',
                        variant: 'primary',
                        onClick: config.onSubmitPrompt,
                        isDisabled: cell.promptDraft.trim().length === 0,
                      },
                      h,
                    ),
                    Button.view(
                      {
                        label: 'Abort',
                        variant: 'secondary',
                        onClick: config.onAbortPrompt,
                        isDisabled: cell.status !== 'pending',
                      },
                      h,
                    ),
                  ],
                },
                h,
              ),
            ],
          },
          h,
        ),
      ],
    },
    h,
  )
}

export const focusedPromptInput = FOCUSED_PROMPT_ID
