#!/usr/bin/env node

/**
 * Sonde de sécurité pour bourges-volley.fr
 * Inspiré de la méthodologie creps-audit-site
 */

import https from 'https';
import http from 'http';

const SITE = 'https://www.bourges-volley.fr';
const ROUTES = [
  '/',
  '/boutique/',
  '/admin/commandes.html',
  '/admin/',
  '/confidentialite',
  '/contact',
  '/mentions-legales',
];

const FUNCTIONS = [
  '/.netlify/functions/commande',
  '/.netlify/functions/commandes',
  '/.netlify/functions/paiement',
  '/.netlify/functions/essai-helloasso',
  '/.netlify/functions/purge-commandes',
  '/.netlify/functions/reconstruire',
];

const EXPECTED_HEADERS = {
  'strict-transport-security': /max-age=\d+/,
  'x-content-type-options': /nosniff/i,
  'x-frame-options': /(DENY|SAMEORIGIN)/i,
  'content-security-policy': /.*/,
  'referrer-policy': /(no-referrer|strict-origin-when-cross-origin|same-origin)/i,
  'permissions-policy': /.*/,
};

function request(url, method = 'GET', body = null) {
  return new Promise((resolve, reject) => {
    const parsed = new URL(url);
    const options = {
      hostname: parsed.hostname,
      port: parsed.port || (parsed.protocol === 'https:' ? 443 : 80),
      path: parsed.pathname + parsed.search,
      method: method,
      headers: body ? { 'Content-Type': 'application/json' } : {},
    };
    
    const req = (parsed.protocol === 'https:' ? https : http).request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          headers: res.headers,
          body: data,
        });
      });
    });
    
    req.on('error', reject);
    
    if (body) {
      req.write(JSON.stringify(body));
    }
    
    req.end();
  });
}

async function testRoutes() {
  console.log('\n=== SONDE DE SÉCURITÉ - BOURGES-VOLLEY.FR ===\n');
  
  const results = {};
  
  // Test 1: Redirection HTTP -> HTTPS
  console.log('Test 1: Redirection HTTP → HTTPS');
  try {
    const httpResult = await request(SITE.replace('https://', 'http://'));
    results.redirect = {
      status: httpResult.status,
      location: httpResult.headers.location,
      ok: httpResult.status === 301 && httpResult.headers.location?.includes('https://'),
    };
    console.log(`  → HTTP 301 vers HTTPS: ${results.redirect.ok ? '✅' : '❌'}`);
  } catch (e) {
    console.log(`  → Erreur: ${e.message}`);
  }
  
  // Test 2: En-têtes de sécurité sur la page d'accueil
  console.log('\nTest 2: En-têtes de sécurité sur /');
  try {
    const home = await request(SITE);
    results.home = {
      status: home.status,
      headers: home.headers,
    };
    
    console.log('  En-têtes présents:');
    for (const [header, pattern] of Object.entries(EXPECTED_HEADERS)) {
      const present = home.headers[header.toLowerCase()] !== undefined;
      const value = home.headers[header.toLowerCase()];
      const matches = present && pattern.test(value);
      console.log(`    ${header}: ${present ? (matches ? '✅' : '⚠️ ' + value) : '❌'}`);
    }
  } catch (e) {
    console.log(`  → Erreur: ${e.message}`);
  }
  
  // Test 3: Routes statiques
  console.log('\nTest 3: Routes statiques');
  for (const route of ROUTES) {
    try {
      const result = await request(SITE + route);
      results[route] = {
        status: result.status,
        headers: result.headers,
      };
      console.log(`  ${route}: ${result.status}`);
    } catch (e) {
      console.log(`  ${route}: Erreur - ${e.message}`);
    }
  }
  
  // Test 4: Fonctions serverless (GET)
  console.log('\nTest 4: Fonctions serverless (GET)');
  for (const fn of FUNCTIONS) {
    try {
      const result = await request(SITE + fn);
      results[fn] = {
        status: result.status,
        bodyPreview: result.body.slice(0, 50),
      };
      console.log(`  ${fn}: ${result.status} - ${result.body.slice(0, 50)}`);
    } catch (e) {
      console.log(`  ${fn}: Erreur - ${e.message}`);
    }
  }
  
  // Test 5: Fonctions serverless (POST sans auth)
  console.log('\nTest 5: Fonctions serverless (POST sans auth)');
  for (const fn of FUNCTIONS) {
    try {
      const result = await request(SITE + fn, 'POST', {});
      results[fn + ':POST'] = {
        status: result.status,
        bodyPreview: result.body.slice(0, 50),
      };
      console.log(`  ${fn} [POST]: ${result.status} - ${result.body.slice(0, 50)}`);
    } catch (e) {
      console.log(`  ${fn} [POST]: Erreur - ${e.message}`);
    }
  }
  
  // Test 6: Vérification spécifique /admin/commandes.html
  console.log('\nTest 6: Vérification spécifique - /admin/commandes.html');
  try {
    const admin = await request(SITE + '/admin/commandes.html');
    const hasAuthCheck = admin.body.includes('Connexion requise') || admin.body.includes('401') || admin.body.includes('403');
    console.log(`  Accessible sans auth: ${admin.status === 200 && !hasAuthCheck ? '❌ PROBLÈME CRITIQUE' : '✅'}`);
    console.log(`  Contient "Connexion requise": ${hasAuthCheck ? '✅' : '❌'}`);
  } catch (e) {
    console.log(`  Erreur: ${e.message}`);
  }
  
  console.log('\n=== FIN DE LA SONDE ===\n');
  
  return results;
}

testRoutes().catch(console.error);
