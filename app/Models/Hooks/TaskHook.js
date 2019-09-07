'use strict'

const Kue = use('Kue')
const Job = use('App/Jobs/NewTaskMail')

const TaskHook = exports = module.exports = {}

TaskHook.sendNewTaskMail = async (taskIntance) => {
  if (!taskIntance.user_id && taskIntance.dirty.user_id) return

  const { email, username } = await taskIntance.user().fetch()
  const file = await taskIntance.file().fetch()

  const { title } = taskIntance

  Kue.dispatch(Job.key, { email, username, title, file }, { attempts: 3 })
}
