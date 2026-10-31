# Sjöskolan module books: encrypted working copy for Codex

This branch is **public**, so the project itself is in an **AES-256 encrypted archive** split into three parts. The owner, Mr. Johansson, gives you the password in the chat. **Never write the password into a file, commit or log.**

## 1. Decrypt (do this first)

```bash
# Put the password from the chat into an environment variable, not into a file:
export ARKIVLOSEN='<password from the chat>'
cat sjoskolan.tar.gz.enc.del* | openssl enc -d -aes-256-cbc -pbkdf2 -iter 200000 -pass env:ARKIVLOSEN > /tmp/sjoskolan.tar.gz
sha256sum /tmp/sjoskolan.tar.gz          # must match ARKIV-SHA256.txt
mkdir -p ~/sjoskolan && tar xzf /tmp/sjoskolan.tar.gz -C ~/sjoskolan && rm /tmp/sjoskolan.tar.gz
cd ~/sjoskolan && git init -q && git add -A && git commit -qm "Utgångsläge från Claude"   # local history for your own commits
```

## 2. Work

In `~/sjoskolan`, read `AGENTS.md`, `HANDOVER.md` and `LOGG.md`, then follow `CODEX-PROMPT.md`. The decrypted folder is the repository root.

**Never commit the decrypted files to this public repository or any other public one.**

## 3. Hand back

You may not be able to push to the private repository. If not, package your work encrypted with the same password, so the owner can pass it to Claude:

```bash
cd ~/sjoskolan && tar czf - --exclude=node_modules --exclude=moduler . | openssl enc -aes-256-cbc -pbkdf2 -iter 200000 -salt -pass env:ARKIVLOSEN -out ~/codex-resultat.tar.gz.enc
```

Then tell the owner where `codex-resultat.tar.gz.enc` is, so he can download it. Do not push it to a public repository.
