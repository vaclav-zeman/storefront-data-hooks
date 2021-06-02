import { useCallback } from 'react'
import type { HookFetcher } from './commerce/utils/types'
import { CommerceError } from './commerce/utils/errors'
import useCommerceSignup from './commerce/use-signup'
import type { SignupBody } from './api/customers/signup'
import useCustomer from './use-customer'

const defaultOpts = {
  url: '/api/bigcommerce/customers/signup',
  method: 'POST',
  base: window.location.host,
}

export type SignupInput = SignupBody

export const fetcher: HookFetcher<null, SignupBody> = (
  options,
  { firstName, lastName, email, password },
  fetch
) => {
  if (!(firstName && lastName && email && password)) {
    throw new CommerceError({
      message:
        'A first name, last name, email and password are required to signup',
    })
  }

  const url = new URL(options?.url ?? defaultOpts.url, options?.base ?? defaultOpts.base)

  return fetch({
    ...defaultOpts,
    ...options,
    url: url.href,
    body: { firstName, lastName, email, password },
  })
}

export function extendHook(customFetcher: typeof fetcher) {
  const useSignup = () => {
    const { revalidate } = useCustomer()
    const fn = useCommerceSignup<null, SignupInput>(defaultOpts, customFetcher)

    return useCallback(
      async function signup(input: SignupInput) {
        const data = await fn(input)
        await revalidate()
        return data
      },
      [fn]
    )
  }

  useSignup.extend = extendHook

  return useSignup
}

export default extendHook(fetcher)
