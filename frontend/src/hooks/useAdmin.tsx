import { useCookies } from 'react-cookie'

type UseAdminReturn = {
  authenticated: boolean
}

const useAdmin = (): UseAdminReturn => {
  const [authenticated] = useCookies(['admin-auth'])

  return { authenticated: !!authenticated }
}

export default useAdmin
