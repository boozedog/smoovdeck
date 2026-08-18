import { Runtime } from 'foldkit'

import '@foldstryx/styles/document.global.css'

import { view } from './main'
import { Message, Model, init, update } from './model'

const application = Runtime.makeApplication({
  Model,
  init,
  update,
  view,
  container: document.getElementById('root'),
  devTools: {
    Message,
  },
})

Runtime.run(application)
