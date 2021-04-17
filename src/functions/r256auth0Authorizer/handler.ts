import { CustomAuthorizerEvent, CustomAuthorizerResult } from 'aws-lambda'

import { verify } from 'jsonwebtoken'
import { JwtToken } from '../../auth/JwtToken'

const cert = `-----BEGIN CERTIFICATE-----
MIIDDTCCAfWgAwIBAgIJcaS22XU/SZvjMA0GCSqGSIb3DQEBCwUAMCQxIjAgBgNV
BAMTGWRldi1ycjZ3dG5ncS51cy5hdXRoMC5jb20wHhcNMjEwNDE2MDU1OTMwWhcN
MzQxMjI0MDU1OTMwWjAkMSIwIAYDVQQDExlkZXYtcnI2d3RuZ3EudXMuYXV0aDAu
Y29tMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAw6knBY6JFDazrDUt
OSSyekOYKdwp3oYxPMVY7M+KRgDnBjFSc71yM9i7590Qc0candVKZ1uxpJIwtO5t
XnuusUeYTQscNpnbi8XrXA0wv2lUUh2n9dHUuWajT3JGT7HSlIBfjT+QOjydq61m
Nrg3gUq9BPoavrlRe4P1HsmlHWglC2LMoubaubRvKyvz3aOgX4SHO4xynqyKbpOQ
4LHN9KkDwjyV0MWyGptlIvhdD5W9a/qgOtBOnRmwPR7XHuusk+BMCN/RzlOSvXrI
YVmI5EbSIHP8QMAwRo0pqiezXsjmU0vQnFPLYeXJplr6nspxggy7MctVICV63iZS
hk1K+QIDAQABo0IwQDAPBgNVHRMBAf8EBTADAQH/MB0GA1UdDgQWBBSpozdheIw/
VdBOmhx71gyr3rnWzzAOBgNVHQ8BAf8EBAMCAoQwDQYJKoZIhvcNAQELBQADggEB
AGZtbD9D9lCqwubr7S4mKW2zgyEaBztK1PBLTUVNCVESFQR+If2+E3T17nENWn5Q
KYMtyldMdY3ymu2Et+aX+56tyI736BbNVqzrcripXD+I7VIMtjbD5FEQvelwxcbP
dWRD4xfOQ47YBW78ICxN2mMU2Yd+Yb0jFFTre1NgFbSUj1bWMnzefktOUMb0qgKF
blpe73cnrTBiNlgzbsPeUMPpgRKxruLlBjxCMqaTQ5G6Mj19LhbRM9Yj8PV7xAeC
mUyURKPVzw0NtG3i0NlICiYfc/AoujeV0awCVRN4P1T3G9YzpyJ2UDiGX/hFyyKp
XJ9e/yuSwdY7eYBx3viIQxk=
-----END CERTIFICATE-----`

export const main = async (event: CustomAuthorizerEvent): Promise<CustomAuthorizerResult> => {
  try {
    const jwtToken = verifyToken(event.authorizationToken)
    console.log('User was authorized', jwtToken)

    return {
      principalId: jwtToken.sub,
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Allow',
            Resource: '*'
          }
        ]
      }
    }
  } catch (e) {
    console.log('User unauthorized', e.message)

    return {
      principalId: 'user',
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Deny',
            Resource: '*'
          }
        ]
      }
    }
  }
}

function verifyToken(authHeader: string): JwtToken {
  if (!authHeader)
    throw new Error('No authentication header')

  if (!authHeader.toLowerCase().startsWith('bearer '))
    throw new Error('Invalid authentication header')

  const split = authHeader.split(' ')
  const token = split[1]

  return verify(token, cert, { algorithms: ['RS256'] }) as JwtToken
}