/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Server,
  Terminal,
  Copy,
  Check,
  CheckCircle2,
  Shield,
  Layers,
  ArrowRight,
  ExternalLink,
  Code2,
  Cpu,
} from 'lucide-react';

export const DeploymentGuideView: React.FC = () => {
  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  const [serverHealth, setServerHealth] = useState<any>(null);

  useEffect(() => {
    fetch('/api/health')
      .then((r) => r.json())
      .then((data) => setServerHealth(data))
      .catch((e) => console.warn('Could not fetch local health:', e));
  }, []);

  const copyToClipboard = (text: string, sectionId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(sectionId);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const dockerComposeCode = `services:
  app:
    build: .
    container_name: vapi-voice-platform
    restart: unless-stopped
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - PORT=3000
      - VAPI_API_KEY=\${VAPI_API_KEY}
      - SUPABASE_URL=\${SUPABASE_URL}
      - SUPABASE_ANON_KEY=\${SUPABASE_ANON_KEY}
    volumes:
      - vapi_data:/app/data
    healthcheck:
      test: ["CMD", "wget", "-qO-", "http://localhost:3000/api/health"]
      interval: 30s
      timeout: 5s

volumes:
  vapi_data:
    driver: local`;

  const ubuntuScriptCommand = `curl -fsSL https://raw.githubusercontent.com/vapi-platform/deploy/main/ubuntu-setup.sh | bash`;

  const nginxConfigCode = `server {
    listen 80;
    server_name voice.yourdomain.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 86400s;
        proxy_send_timeout 86400s;
    }
}`;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-100">
            BlueSpider AI Dialer · Ubuntu &amp; Docker Deployment
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Production orchestration guides for Ubuntu 22.04 / 24.04 LTS containerized deployment with automated Nginx reverse proxy and SSL.
          </p>
        </div>

        {/* Live Container Health Badge */}
        <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs font-mono">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="text-slate-300">Container Status:</span>
          <span className="text-emerald-400 font-bold uppercase">
            {serverHealth?.status || 'HEALTHY'}
          </span>
          <span className="text-slate-500">|</span>
          <span className="text-slate-400">
            Uptime: {serverHealth?.uptime ? `${Math.round(serverHealth.uptime)}s` : 'Active'}
          </span>
        </div>
      </div>

      {/* 3 Step Deployment Pipeline Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-slate-900/60 border border-slate-800/80 rounded-xl space-y-2">
          <div className="w-7 h-7 rounded-lg bg-indigo-950 flex items-center justify-center text-indigo-400 font-mono text-xs font-bold">
            01
          </div>
          <h3 className="text-sm font-bold text-slate-100">
            Provision Ubuntu Server
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Run on any cloud VM (AWS EC2, DigitalOcean, Hetzner, GCP Compute Engine). Ubuntu 22.04 or 24.04 LTS recommended with 2GB+ RAM.
          </p>
        </div>

        <div className="p-4 bg-slate-900/60 border border-slate-800/80 rounded-xl space-y-2">
          <div className="w-7 h-7 rounded-lg bg-indigo-950 flex items-center justify-center text-indigo-400 font-mono text-xs font-bold">
            02
          </div>
          <h3 className="text-sm font-bold text-slate-100">
            Docker Multi-Stage Build
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            The multi-stage `Dockerfile` compiles the Vite SPA bundle, starts the Express server, and maps persistent JSON/SQLite storage volumes.
          </p>
        </div>

        <div className="p-4 bg-slate-900/60 border border-slate-800/80 rounded-xl space-y-2">
          <div className="w-7 h-7 rounded-lg bg-indigo-950 flex items-center justify-center text-indigo-400 font-mono text-xs font-bold">
            03
          </div>
          <h3 className="text-sm font-bold text-slate-100">
            Nginx & SSL Automation
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Includes full Nginx reverse proxy configuration supporting WebSocket upgrades for real-time audio streams and free Let's Encrypt certificates.
          </p>
        </div>
      </div>

      {/* Automated Ubuntu Provisioning Command */}
      <div className="p-5 bg-slate-900/60 border border-slate-800/80 rounded-xl space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-emerald-400" />
            <h2 className="text-sm font-semibold text-slate-200">
              Method A: One-Line Ubuntu Setup Script
            </h2>
          </div>
          <span className="text-[10px] font-mono text-slate-400">
            Installs Docker, Nginx, UFW, and Systemd
          </span>
        </div>

        <p className="text-xs text-slate-400">
          SSH into your fresh Ubuntu instance and execute the deployment helper script located at <code className="text-indigo-300 font-mono">/deploy/ubuntu-setup.sh</code>:
        </p>

        <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 font-mono text-xs flex items-center justify-between text-emerald-400">
          <span className="select-all">
            sudo chmod +x deploy/ubuntu-setup.sh && ./deploy/ubuntu-setup.sh
          </span>
          <button
            onClick={() => copyToClipboard('sudo chmod +x deploy/ubuntu-setup.sh && ./deploy/ubuntu-setup.sh', 'sh')}
            className="flex items-center gap-1 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-[11px] cursor-pointer"
          >
            {copiedSection === 'sh' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
            <span>{copiedSection === 'sh' ? 'Copied' : 'Copy'}</span>
          </button>
        </div>
      </div>

      {/* Docker Compose Specification */}
      <div className="p-5 bg-slate-900/60 border border-slate-800/80 rounded-xl space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-indigo-400" />
            <h2 className="text-sm font-semibold text-slate-200">
              Method B: Docker Compose Configuration (<code className="text-indigo-300 font-mono">docker-compose.yml</code>)
            </h2>
          </div>
          <button
            onClick={() => copyToClipboard(dockerComposeCode, 'compose')}
            className="flex items-center gap-1 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-[11px] cursor-pointer"
          >
            {copiedSection === 'compose' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
            <span>{copiedSection === 'compose' ? 'Copied' : 'Copy YAML'}</span>
          </button>
        </div>

        <pre className="p-4 bg-slate-950 rounded-xl border border-slate-800 font-mono text-xs text-slate-300 overflow-x-auto leading-relaxed">
          {dockerComposeCode}
        </pre>

        <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 text-xs text-slate-300 flex items-center justify-between font-mono">
          <span>Run Container: <strong className="text-indigo-400">docker compose up -d --build</strong></span>
          <button
            onClick={() => copyToClipboard('docker compose up -d --build', 'up')}
            className="text-slate-400 hover:text-slate-200 cursor-pointer text-xs"
          >
            {copiedSection === 'up' ? 'Copied!' : 'Copy'}
          </button>
        </div>
      </div>

      {/* Nginx Reverse Proxy & SSL */}
      <div className="p-5 bg-slate-900/60 border border-slate-800/80 rounded-xl space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-purple-400" />
            <h2 className="text-sm font-semibold text-slate-200">
              Nginx Reverse Proxy & WebSocket Configuration
            </h2>
          </div>
          <button
            onClick={() => copyToClipboard(nginxConfigCode, 'nginx')}
            className="flex items-center gap-1 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-[11px] cursor-pointer"
          >
            {copiedSection === 'nginx' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
            <span>{copiedSection === 'nginx' ? 'Copied' : 'Copy Nginx'}</span>
          </button>
        </div>

        <pre className="p-4 bg-slate-950 rounded-xl border border-slate-800 font-mono text-xs text-slate-300 overflow-x-auto leading-relaxed">
          {nginxConfigCode}
        </pre>

        {/* Certbot Command */}
        <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 text-xs space-y-1">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
            Obtain Free Let's Encrypt SSL Certificate:
          </span>
          <div className="flex items-center justify-between font-mono text-slate-300 pt-0.5">
            <span className="text-emerald-400 select-all">sudo certbot --nginx -d voice.yourdomain.com</span>
            <button
              onClick={() => copyToClipboard('sudo certbot --nginx -d voice.yourdomain.com', 'ssl')}
              className="text-slate-400 hover:text-slate-200 cursor-pointer text-xs"
            >
              {copiedSection === 'ssl' ? 'Copied!' : 'Copy'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
