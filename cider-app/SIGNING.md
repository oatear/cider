# Mac App Store Signing

https://www.electron.build/code-signing-mac

## Registering Devices

1. Visit https://developer.apple.com/account/resources/devices/list.
2. Click `Add`.
3. Provide the name of the device and the UUID.
    - Apple > System Information.
    - If your computer has a `UDID` (Apple Silicon), use that for the `UUID`.

## Creating a New Signing Certificate

1. Create a new Certificate Signing Request (CSR)
    ```bash
    openssl req -new -newkey rsa:2048 -nodes -keyout private.key -out oatear_csr.certSigningRequest -subj "/emailAddress=contact@oatear.com, CN=Oatear LLC, C=US"
    ```
2. Visit the [Apple Developer Website](https://developer.apple.com/account/resources/certificates/list) and create and download the new Certificates
    - If distributing on the Mac App Store
        - `Mac Installer Distribution` (formerly called: `3rd Party Mac Developer Installer`)
        - `Mac App Distribution` (formerly called: `3rd Party Mac Application`).
    - If distributing externally (Ex. GitHub)
        - `Developer ID Application`
3. Bundle the .pem (generated from your .cer) and your OpenSSL .key into a .p12 (it will ask you to create a password)
    ```bash
    # Convert .cer to .pem
    openssl x509 -in cert.cer -out cert.pem
    
    # Bundle the .pem and your OpenSSL .key into a .p12
    openssl pkcs12 -export -out certs.p12 -inkey private.key -in cert.pem
    ```
4. Install the new Certificate Locally (on your computer)
    - Double click the `.p12` file to install it in **Keychain Access**.
5. Delete expired certificates from **Keychain Access**:
    - `Mac Developer ID Application: Oatear LLC (9482948294)`
    - `Mac Developer ID Installer: Oatear LLC (9482948294)`
    - `Mac App Distribution: Oatear LLC (9482948294)`
    - `Mac Installer Distribution: Oatear LLC (9482948294)`

## Updating a Provisioning Profile (for Mac App Store)

1. Visit https://developer.apple.com/account/resources/profiles/list.
2. Click the expired profile and then click `Edit`.
3. Click `Create Certificate` and select ~~`Mac Installer Distribution`~~ `Mac App Distribution`.

## Updating GitHub Secrets

Further details on the [action-electron-builder](https://github.com/oatear/action-electron-builder?tab=readme-ov-file#code-signing) action documentation.

### `MAS_PROVISIONING_PROFILE`
1. Download a new provisioningprofile on the [Apple Developer site](https://developer.apple.com/account/resources/profiles/list).
2. Encode the downloaded profile 
    ```bash
    base64 -i cider.provisioningprofile > base64-profile
    ```
3. Upload to GitHub Settings > Secrets and variables > Actions
    - Name: `MAS_PROVISIONING_PROFILE`
    - Secret: `{base64 from above}`

### `MAC_CERTS` and `MAC_CERTS_PASSWORD`
1. Create a cryptographically strong password.
    ```bash
    openssl rand -base64 32
    ```
2. Open **Keychain Access** and export all certficates related to your app into a single file (ex. `certs.p12`) and use the strong password generated above.
    ```bash
    security export -f PKCS12 -k login.keychain-db -t cert -o cert.p12 -x509Certificate cert.cer -privateKey private_key.key
    ```
3. Encode the exported certificate.
    ```bash
    base64 -i certs.p12 > base64-cert
    ```
4. Upload to GitHub Settings > Secrets and variables > Actions
    - Name: `MAC_CERTS`
    - Secret: `{base64 from above}`
    - Name: `MAC_CERTS_PASSWORD`
    - Secret: `{password from above}`

## Troubleshooting

### List available code signing certs

```bash
security find-identity -p codesigning -v
```

```bash
security find-identity -v
```

### Create a cryptographically strong password
```bash
openssl rand -base64 32
```

### Read the certs inside a p12 file

List certs and keys inside the p12 file.
```bash
openssl pkcs12 -in certs.p12 -info -nodes -legacy
```

List more info about the certs inside the p12 file.
```bash
openssl pkcs12 -in certs.p12 -nokeys -info -legacy | openssl x509 -text -noout
```

### List information about a certificate (.cer)
```bash
openssl x509 -in cert.cer -text -noout
```

