import type { Document, HtmlBuilder } from 'foldkit/html'

import { Icon, Sidebar, Stack, Text, elAttrs, sxAttrs } from '@foldstryx/foldkit'
import { sidebarStyles } from '@foldstryx/styles'

import { boardHeaderTitle, view as boardView } from './board'
import { view as focusedView } from './focused'
import { type Message, type Model } from './model'

export const view = (model: Model, h: HtmlBuilder<Message>): Document => ({
  title: 'smoovdeck',
  body: h.div(elAttrs<Message>(sxAttrs(h, sidebarStyles.shell)), [
    Sidebar.desktop<Message>(
      {
        brand: {
          name: 'smoovdeck',
          subtitle: 'control deck',
          icon: Icon.appMark,
        },
        groups: [],
        onToggleSidebar: { _tag: 'ToggleSidebar' },
      },
      { isCollapsed: model.collapsed },
      h,
    ),
    Sidebar.inset<Message>(
      {
        isCollapsed: model.collapsed,
        headerChildren: [
          Text.view(
            {
              variant: 'sectionTitle',
              children: boardHeaderTitle(
                model.workspaces,
                model.selectedCell,
              ),
            },
            h,
          ),
        ],
        children: Stack.view(
          {
            gap: 'md',
            children: [
              boardView(
                {
                  workspaces: model.workspaces,
                  selectedCell: model.selectedCell,
                  onSelectCell: (workspaceId, stage) => ({
                    _tag: 'SelectCell',
                    workspaceId,
                    stage,
                  }),
                },
                h,
              ),
              focusedView(
                {
                  workspaces: model.workspaces,
                  selectedCell: model.selectedCell,
                  onUpdatePromptDraft: value => ({
                    _tag: 'UpdatePromptDraft',
                    value,
                  }),
                  onSubmitPrompt: { _tag: 'SubmitPrompt' },
                  onAbortPrompt: { _tag: 'AbortPrompt' },
                },
                h,
              ),
            ],
          },
          h,
        ),
      },
      h,
    ),
  ]),
})
