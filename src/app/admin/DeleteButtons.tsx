'use client'

import { useTransition } from 'react'

export function DeleteUserButton({
  id,
  name,
  deleteAction,
}: {
  id: string
  name: string | null
  deleteAction: (formData: FormData) => Promise<void>
}) {
  const [pending, startTransition] = useTransition()

  function handleClick() {
    if (!confirm(`Delete ${name ?? 'this user'}? This cannot be undone.`)) return
    const fd = new FormData()
    fd.append('id', id)
    startTransition(() => deleteAction(fd))
  }

  return (
    <button
      onClick={handleClick}
      disabled={pending}
      className="text-xs text-destructive hover:underline font-medium disabled:opacity-50"
    >
      {pending ? 'Deleting…' : 'Delete'}
    </button>
  )
}

export function DeleteBranchButton({
  id,
  name,
  deleteAction,
}: {
  id: string
  name: string
  deleteAction: (formData: FormData) => Promise<void>
}) {
  const [pending, startTransition] = useTransition()

  function handleClick() {
    if (!confirm(`Delete branch "${name}"? This cannot be undone.`)) return
    const fd = new FormData()
    fd.append('id', id)
    startTransition(() => deleteAction(fd))
  }

  return (
    <button
      onClick={handleClick}
      disabled={pending}
      className="text-xs text-destructive hover:underline font-medium disabled:opacity-50"
    >
      {pending ? 'Deleting…' : 'Delete'}
    </button>
  )
}

export function DeleteCategoryButton({
  id,
  name,
  deleteAction,
}: {
  id: string
  name: string
  deleteAction: (formData: FormData) => Promise<void>
}) {
  const [pending, startTransition] = useTransition()

  function handleClick() {
    if (!confirm(`Permanently delete category "${name}"? This cannot be undone.`)) return
    const fd = new FormData()
    fd.append('id', id)
    startTransition(() => deleteAction(fd))
  }

  return (
    <button
      onClick={handleClick}
      disabled={pending}
      className="text-xs text-destructive hover:underline font-medium disabled:opacity-50"
    >
      {pending ? 'Removing…' : 'Delete'}
    </button>
  )
}
export function DeleteSubCategoryButton({
  id,
  name,
  deleteAction,
}: {
  id: string
  name: string
  deleteAction: (formData: FormData) => Promise<void>
}) {
  const [pending, startTransition] = useTransition()

  function handleClick() {
    if (!confirm(`Delete position "${name}"? This cannot be undone.`)) return
    const fd = new FormData()
    fd.append('id', id)
    startTransition(() => deleteAction(fd))
  }

  return (
    <button
      onClick={handleClick}
      disabled={pending}
      className="text-[10px] text-destructive hover:underline font-bold disabled:opacity-50 uppercase tracking-tight"
    >
      {pending ? '...' : 'Remove'}
    </button>
  )
}
