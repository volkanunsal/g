export function deleteRecord(payload: {
  model: string
  obj: undefined | Record<string, any>
  args: Record<string, any>
  ctx: Record<string, any>
  auth: Record<string, any> | undefined
  info: Record<string, any>
}): Record<string, any> | null {
  // Apply auth rules, if they exist
  console.log('auth: ', payload.auth)
  // TODO: get the records from ORM
  return null
}
