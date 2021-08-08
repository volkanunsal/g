export function listRecords(payload: {
  model: string
  obj: undefined | Record<string, any>
  args: Record<string, any>
  ctx: Record<string, any>
  auth: Record<string, any> | undefined
  info: Record<string, any>
}): { items: Record<string, any>[]; nextToken: string | null } {
  // Apply auth rules, if they exist
  console.log('auth: ', payload.auth)
  // TODO: get the records from ORM
  const items = [{ id: 1 }]
  return { items, nextToken: null }
}
