#!/usr/bin/env bash
# Prints the three secret values you need in .env
# Run:  bash deploy/generate-keys.sh
set -e
command -v node >/dev/null || { echo "Please install Node.js first."; exit 1; }
JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")

sign() {
  node -e "
const c=require('crypto');
const h=Buffer.from(JSON.stringify({alg:'HS256',typ:'JWT'})).toString('base64url');
const p=Buffer.from(JSON.stringify({role:'$1',iss:'supabase',iat:Math.floor(Date.now()/1000),exp:Math.floor(Date.now()/1000)+60*60*24*365*10})).toString('base64url');
const s=c.createHmac('sha256','$JWT_SECRET').update(h+'.'+p).digest('base64url');
console.log(h+'.'+p+'.'+s);
"
}

echo ""
echo "Copy these into your .env file:"
echo ""
echo "JWT_SECRET=$JWT_SECRET"
echo "VITE_SUPABASE_PUBLISHABLE_KEY=$(sign anon)"
echo "SUPABASE_PUBLISHABLE_KEY=$(sign anon)"
echo "SUPABASE_SERVICE_ROLE_KEY=$(sign service_role)"
echo ""
echo "Keep JWT_SECRET and SUPABASE_SERVICE_ROLE_KEY private."
