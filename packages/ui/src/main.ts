import type { Document, HtmlBuilder } from 'foldkit/html'

import { Icon, Sidebar, Text, elAttrs, sxAttrs } from '@foldstryx/foldkit'
import { sidebarStyles } from '@foldstryx/styles'

import { boardHeaderTitle, view as boardView } from './board'
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
        children: boardView(
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
      },
      h,
    ),
  ]),
})
