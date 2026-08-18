import { Schema as S } from 'effect'
import type { HtmlBuilder } from 'foldkit/html'

import { Badge, Stack, Table, Text } from '@foldstryx/foldkit'

import type { Message as AppMessage } from './model.js'

export const Stage = S.Literals([
  'research',
  'impl',
  'review',
  'git',
  'fish',
])
export type Stage = typeof Stage.Type

export const STAGES: ReadonlyArray<Stage> = [
  'research',
  'impl',
  'review',
  'git',
  'fish',
]

export const StageCell = S.Struct({
  status: S.Literal('idle'),
  provider: S.String,
})
export type StageCell = typeof StageCell.Type

export const WorkspaceCells = S.Struct({
  research: StageCell,
  impl: StageCell,
  review: StageCell,
  git: StageCell,
  fish: StageCell,
})
export type WorkspaceCells = typeof WorkspaceCells.Type

export const Workspace = S.Struct({
  id: S.String,
  label: S.String,
  cells: WorkspaceCells,
})
export type Workspace = typeof Workspace.Type

export const SelectedCell = S.Struct({
  workspaceId: S.String,
  stage: Stage,
})
export type SelectedCell = typeof SelectedCell.Type

const providerForStage = (stage: Stage): string => {
  switch (stage) {
    case 'research':
    case 'impl':
    case 'review':
      return 'grok'
    case 'git':
      return 'lazygit'
    case 'fish':
      return 'fish'
  }
}

const idleCell = (stage: Stage): StageCell => ({
  status: 'idle',
  provider: providerForStage(stage),
})

const makeCells = (): WorkspaceCells => ({
  research: idleCell('research'),
  impl: idleCell('impl'),
  review: idleCell('review'),
  git: idleCell('git'),
  fish: idleCell('fish'),
})

export const dummyWorkspaces: ReadonlyArray<Workspace> = [
  { id: 'local-a', label: 'local-a', cells: makeCells() },
  { id: 'local-b', label: 'local-b', cells: makeCells() },
]

export const boardHeaderTitle = (
  workspaces: ReadonlyArray<Workspace>,
  selectedCell: SelectedCell | undefined,
): string => {
  if (selectedCell === undefined) {
    return 'Board'
  }
  const workspace = workspaces.find(w => w.id === selectedCell.workspaceId)
  const label = workspace?.label ?? selectedCell.workspaceId
  return `Board · ${label} · ${selectedCell.stage}`
}

export const view = (
  config: Readonly<{
    workspaces: ReadonlyArray<Workspace>
    selectedCell: SelectedCell | undefined
    onSelectCell: (workspaceId: string, stage: Stage) => AppMessage
  }>,
  h: HtmlBuilder<AppMessage>,
) =>
  Table.wrap(
    [
      Table.table(
        [
          Table.thead(
            [
              Table.tr(
                {
                  children: [
                    Table.th('', h),
                    ...STAGES.map(stage => Table.th(stage, h)),
                  ],
                },
                h,
              ),
            ],
            h,
          ),
          Table.tbody(
            config.workspaces.map(workspace =>
              Table.tr(
                {
                  children: [
                    Table.td(
                      {
                        align: 'plain',
                        children: [
                          Text.view(
                            {
                              variant: 'mono',
                              children: workspace.label,
                            },
                            h,
                          ),
                        ],
                      },
                      h,
                    ),
                    ...STAGES.map(stage => {
                      const cell = workspace.cells[stage]
                      const isSelected =
                        config.selectedCell?.workspaceId === workspace.id &&
                        config.selectedCell?.stage === stage

                      return Table.td(
                        {
                          align: 'plain',
                          onClick: config.onSelectCell(workspace.id, stage),
                          isPressed: isSelected,
                          children: [
                            Stack.view(
                              {
                                gap: 'xs',
                                children: [
                                  Badge.view(
                                    {
                                      label: cell.status,
                                      variant: 'secondary',
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
                          ],
                        },
                        h,
                      )
                    }),
                  ],
                },
                h,
              ),
            ),
            h,
          ),
        ],
        h,
      ),
    ],
    h,
  )
