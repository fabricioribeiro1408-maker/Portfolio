/* ================================================================
   playground.js — AI Dashboard Playground
   DeepSeek API integration, CSV import, dashboard rendering,
   Fullscreen, tutorial walkthrough.
   ================================================================ */
(function () {
  'use strict';

  /* ── Config ──────────────────────────────────────────── */
  var API_URL = 'https://deepseek-proxy.fabricioribeiro1408.workers.dev';

  var RATE_LIMIT_MS = 60000;

  /* ── State ───────────────────────────────────────────── */
  var lastGenTime = 0;
  var csvData = null;
  var lastUserPrompt = '';

  /* ── DOM refs ────────────────────────────────────────── */
  var $model      = document.getElementById('pg-model');
  var $temp       = document.getElementById('pg-temp');
  var $tempDisp   = document.getElementById('pg-temp-display');
  var $tempLabel  = document.getElementById('pg-temp-label');
  var $send       = document.getElementById('pg-send');
  var $clear      = document.getElementById('pg-clear');
  var $demo       = document.getElementById('pg-demo');
  var $input      = document.getElementById('pg-input');
  var $chat       = document.getElementById('pg-chat');
  var $empty      = document.getElementById('pg-empty');
  var $dashboard  = document.getElementById('pg-dashboard');
  var $dashCont   = document.getElementById('pg-dash-content');
  var $dashModel  = document.getElementById('pg-dash-model');
  // PDF export removed
  var $fullscreen = document.getElementById('pg-fullscreen');
  var $status     = document.getElementById('pg-status');
  var $csvZone    = document.getElementById('csv-zone');
  var $csvFile    = document.getElementById('csv-file');
  var $csvText    = document.getElementById('csv-zone-text');
  var $gallery    = document.getElementById('pg-gallery-grid');
  var $examples   = document.getElementById('pg-examples');

  /* ── Helpers ─────────────────────────────────────────── */
  function escHtml(s) {
    var d = document.createElement('div');
    d.appendChild(document.createTextNode(s));
    return d.innerHTML;
  }

  function setStatus(msg, isError) {
    $status.textContent = msg;
    $status.style.color = isError ? '#f87171' : '';
  }

  /* ── 1. Temperature control ──────────────────────────── */
  $temp.addEventListener('input', function () {
    var v = $temp.value;
    $tempDisp.textContent = v;
    $tempLabel.textContent = v;
  });

  /* ── 2. Example buttons ─────────────────────────────── */
  var exampleData = {
    portfolio: 'Carteira de 8 clientes Enterprise: Acme Corp (Health Score: 92, NPS: 9, MRR: R$45k, risco: baixo), TechFlow (HS: 67, NPS: 6, MRR: R$82k, risco: alto - 3 tickets críticos abertos), GlobalNet (HS: 88, NPS: 8, MRR: R$120k, risco: medio), DataPrime (HS: 45, NPS: 4, MRR: R$35k, risco: critico - sem login há 30 dias), CloudBase (HS: 95, NPS: 10, MRR: R$200k, risco: baixo), NetSecure (HS: 73, NPS: 7, MRR: R$55k, risco: medio), InfoTech (HS: 81, NPS: 8, MRR: R$90k, risco: baixo), SmartOps (HS: 58, NPS: 5, MRR: R$42k, risco: alto)',
    sla: 'SLA do ultimo trimestre: Janeiro - 847 tickets, 812 dentro do SLA (95.9%), MTTR 14min. Fevereiro - 923 tickets, 901 dentro do SLA (97.6%), MTTR 11min. Marco - 1102 tickets, 1058 dentro do SLA (96.0%), MTTR 13min. Categorias criticas: Rede (32%), Sistema (28%), Acesso (22%), Outros (18%). Meta SLA: 95%.',
    equipe: 'Performance da equipe de suporte - Q1 2026: Ana (342 tickets, CSAT 4.8, tempo médio 12min, resolução 1o contato 89%), Carlos (298 tickets, CSAT 4.6, tempo médio 15min, resolução 1o contato 82%), Marina (376 tickets, CSAT 4.9, tempo médio 10min, resolução 1o contato 93%), Pedro (315 tickets, CSAT 4.3, tempo médio 18min, resolução 1o contato 75%), Julia (401 tickets, CSAT 4.7, tempo médio 11min, resolução 1o contato 88%)'
  };

  document.querySelectorAll('.pg-example-btn[data-example]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var key = btn.getAttribute('data-example');
      if (exampleData[key]) {
        $input.value = exampleData[key];
        $input.focus();
      }
    });
  });

  /* ── 3. Demo mode ───────────────────────────────────── */
  var DEMO_JSON = {"title":"Dashboard - Carteira Enterprise Q1","kpis":[{"value":"8","label":"Clientes Ativos"},{"value":"R$669k","label":"MRR Total"},{"value":"74.9","label":"Health Score Médio"},{"value":"2","label":"Contas em Risco"}],"chart":{"type":"bar","title":"Health Score por Cliente","items":[{"label":"CloudBase","value":95,"max":100,"badge":"ok","badgeText":"Saudável"},{"label":"Acme","value":92,"max":100,"badge":"ok","badgeText":"Saudável"},{"label":"GlobalNet","value":88,"max":100,"badge":"ok","badgeText":"Estável"},{"label":"InfoTech","value":81,"max":100,"badge":"ok","badgeText":"Estável"},{"label":"NetSecure","value":73,"max":100,"badge":"warn","badgeText":"Atenção"},{"label":"TechFlow","value":67,"max":100,"badge":"warn","badgeText":"Risco"},{"label":"SmartOps","value":58,"max":100,"badge":"bad","badgeText":"Crítico"},{"label":"DataPrime","value":45,"max":100,"badge":"bad","badgeText":"Crítico"}]},"table":{"headers":["Cliente","MRR","NPS","Status"],"rows":[["CloudBase","R$200k","10",{"badge":"ok","text":"Saudável"}],["Acme Corp","R$45k","9",{"badge":"ok","text":"Saudável"}],["GlobalNet","R$120k","8",{"badge":"ok","text":"Estável"}],["TechFlow","R$82k","6",{"badge":"warn","text":"Risco"}],["DataPrime","R$35k","4",{"badge":"bad","text":"Crítico"}]]},"notes":[{"title":"Alerta Estratégico","text":"DataPrime sem login há 30 dias e TechFlow com 3 tickets críticos exigem intervenção imediata. Recomendação: agendar health check com ambos esta semana."}]};

  $demo.addEventListener('click', function () {
    addMsg('assistant', 'Dashboard de demonstra\u00e7\u00e3o carregado.');
    renderDashboard(DEMO_JSON, 'demo');
  });

  /* ── 4. Dashboard Gallery ───────────────────────────── */
  var galleryCards = [
    {
      title: 'Carteira Enterprise Q1',
      kpis: [
        { value: '8', label: 'Clientes' },
        { value: 'R$669k', label: 'MRR Total' },
        { value: '74.9', label: 'Health Score' }
      ]
    },
    {
      title: 'An\u00e1lise SLA Trimestral',
      kpis: [
        { value: '96.5%', label: 'SLA Médio' },
        { value: '2.872', label: 'Tickets' },
        { value: '9min', label: 'MTTR' }
      ]
    },
    {
      title: 'Performance Equipe Q1',
      kpis: [
        { value: '1.732', label: 'Tickets' },
        { value: '4.66', label: 'CSAT Médio' },
        { value: '85.4%', label: 'FCR' }
      ]
    }
  ];

  function buildGallery() {
    if (!$gallery) return;
    $gallery.innerHTML = '';
    galleryCards.forEach(function (card) {
      var el = document.createElement('div');
      el.className = 'pg-gallery-card';
      el.style.cssText = 'cursor:pointer;padding:1rem;border:1px solid rgba(244,242,238,.08);border-radius:8px;background:rgba(244,242,238,.02);transition:border-color .3s;';

      var title = document.createElement('div');
      title.style.cssText = 'font-family:var(--f-mono);font-size:.6rem;letter-spacing:.12em;text-transform:uppercase;color:var(--muted);margin-bottom:.6rem;';
      title.textContent = card.title;
      el.appendChild(title);

      var kpiRow = document.createElement('div');
      kpiRow.style.cssText = 'display:flex;gap:.6rem;';
      card.kpis.forEach(function (k) {
        var kpiBox = document.createElement('div');
        kpiBox.style.cssText = 'flex:1;padding:.5rem;border-radius:6px;background:rgba(244,242,238,.04);text-align:center;';

        var val = document.createElement('div');
        val.style.cssText = 'font-size:.9rem;font-weight:600;color:var(--white);';
        val.textContent = k.value;
        kpiBox.appendChild(val);

        var lbl = document.createElement('div');
        lbl.style.cssText = 'font-size:.5rem;color:var(--mid);margin-top:.15rem;';
        lbl.textContent = k.label;
        kpiBox.appendChild(lbl);

        kpiRow.appendChild(kpiBox);
      });
      el.appendChild(kpiRow);

      el.addEventListener('mouseenter', function () { el.style.borderColor = 'rgba(244,242,238,.2)'; });
      el.addEventListener('mouseleave', function () { el.style.borderColor = 'rgba(244,242,238,.08)'; });
      el.addEventListener('click', function () {
        addMsg('assistant', 'Dashboard de demonstra\u00e7\u00e3o carregado.');
        renderDashboard(DEMO_JSON, 'demo');
      });

      $gallery.appendChild(el);
    });
  }

  buildGallery();

  /* ── 5. API Call ─────────────────────────────────────── */
  function buildPromptText() {
    var text = ($input.value || '').trim();
    var combined = '';

    if (csvData && text) {
      combined = 'Dados CSV importados:\n' + csvData + '\n\nInstrução do usuário: ' + text;
    } else if (csvData) {
      combined = 'Analise os seguintes dados CSV e gere um dashboard estratégico com KPIs, gráfico e tabela:\n' + csvData;
    } else {
      combined = text;
    }
    return combined;
  }

  function callAPI() {
    var now = Date.now();
    var elapsed = now - lastGenTime;
    if (elapsed < RATE_LIMIT_MS) {
      var wait = Math.ceil((RATE_LIMIT_MS - elapsed) / 1000);
      setStatus('Aguarde ' + wait + ' segundos para gerar outro dashboard.', true);
      return;
    }

    var prompt = buildPromptText();
    if (!prompt) {
      setStatus('Digite ou importe dados para gerar o dashboard.', true);
      return;
    }

    lastUserPrompt = csvData ? '' : ($input.value || '').trim();

    addMsg('user', $input.value || (csvData ? '[CSV importado]' : ''));

    $send.disabled = true;
    $send.textContent = 'Gerando...';
    setStatus('Conectando ao DeepSeek...');

    var model = $model.value;
    var temp = parseFloat($temp.value);

    var systemPrompt = 'Você é um especialista em visualização de dados e dashboards de Customer Success. '
      + 'Analise os dados fornecidos e retorne APENAS um JSON válido (sem markdown, sem texto extra) com esta estrutura exata: '
      + '{"title":"string","kpis":[{"value":"string","label":"string"}],'
      + '"chart":{"type":"bar","title":"string","items":[{"label":"string","value":number,"max":number,"badge":"ok|warn|bad","badgeText":"string"}]},'
      + '"table":{"headers":["string"],"rows":[["string" ou {"badge":"ok|warn|bad","text":"string"}]]},'
      + '"notes":[{"title":"string","text":"string"}]}'
      + '\nRetorne SOMENTE o JSON. Sem explicações, sem blocos de código.';

    var body = {
      model: model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt }
      ],
      temperature: temp,
      max_tokens: 4096
    };

    fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body)
    })
    .then(function (res) {
      if (!res.ok) {
        return res.text().then(function (t) { throw new Error('API error ' + res.status + ': ' + t); });
      }
      return res.json();
    })
    .then(function (data) {
      lastGenTime = Date.now();
      var content = '';
      if (data.choices && data.choices[0] && data.choices[0].message) {
        content = data.choices[0].message.content || '';
      }

      // Strip markdown code fences if present
      content = content.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();

      var parsed;
      try {
        parsed = JSON.parse(content);
      } catch (e) {
        addMsg('assistant', 'Erro ao interpretar resposta da IA. Resposta bruta:\n' + content);
        setStatus('Erro no parse do JSON.', true);
        return;
      }

      addMsg('assistant', 'Dashboard gerado com sucesso.');
      renderDashboard(parsed, model);
      setStatus('Dashboard gerado.');
    })
    .catch(function (err) {
      addMsg('assistant', 'Erro: ' + err.message);
      setStatus('Falha na requisição.', true);
    })
    .finally(function () {
      $send.disabled = false;
      $send.textContent = 'Gerar \u2197';
    });
  }

  $send.addEventListener('click', callAPI);

  $input.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      callAPI();
    }
  });

  /* ── 6. CSV Handling ─────────────────────────────────── */
  function parseCSV(text) {
    csvData = text;
    var lines = text.split('\n').filter(function (l) { return l.trim(); });
    var count = lines.length > 1 ? lines.length - 1 : lines.length;
    $csvText.textContent = 'CSV carregado (' + count + ' linhas). Clique para trocar.';
    $csvZone.style.borderColor = 'rgba(74,222,128,.4)';
  }

  function handleFile(file) {
    if (!file || !file.name.endsWith('.csv')) {
      setStatus('Apenas arquivos .csv sao aceitos.', true);
      return;
    }
    var reader = new FileReader();
    reader.onload = function (e) { parseCSV(e.target.result); };
    reader.readAsText(file);
  }

  $csvFile.addEventListener('change', function () {
    if ($csvFile.files && $csvFile.files[0]) handleFile($csvFile.files[0]);
  });

  $csvZone.addEventListener('click', function (e) {
    if (e.target !== $csvFile) $csvFile.click();
  });

  $csvZone.addEventListener('dragover', function (e) {
    e.preventDefault();
    $csvZone.style.borderColor = 'rgba(244,242,238,.3)';
  });

  $csvZone.addEventListener('dragleave', function () {
    $csvZone.style.borderColor = csvData ? 'rgba(74,222,128,.4)' : '';
  });

  $csvZone.addEventListener('drop', function (e) {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
  });

  /* ── 7. Dashboard Rendering ─────────────────────────── */
  function badgeClass(badge) {
    if (badge === 'ok')   return 'background:rgba(74,222,128,.15);color:#4ade80;';
    if (badge === 'warn') return 'background:rgba(250,204,21,.15);color:#facc15;';
    if (badge === 'bad')  return 'background:rgba(248,113,113,.15);color:#f87171;';
    return '';
  }

  function renderDashboard(data, modelName) {
    $empty.style.display = 'none';
    $dashboard.style.display = '';
    $dashModel.textContent = modelName || '';
    // pdf removed
    $fullscreen.style.display = '';

    var html = '';

    // Title
    if (data.title) {
      html += '<div style="font-size:1.1rem;font-weight:600;margin-bottom:1rem;color:var(--white);">' + escHtml(data.title) + '</div>';
    }

    // KPIs
    if (data.kpis && data.kpis.length) {
      html += '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:.75rem;margin-bottom:1.2rem;">';
      data.kpis.forEach(function (k) {
        html += '<div style="padding:1rem;border-radius:8px;background:rgba(244,242,238,.04);border:1px solid rgba(244,242,238,.08);text-align:center;">'
              + '<div style="font-size:1.4rem;font-weight:700;color:var(--white);">' + escHtml(k.value) + '</div>'
              + '<div style="font-size:.65rem;color:var(--mid);margin-top:.25rem;letter-spacing:.06em;text-transform:uppercase;">' + escHtml(k.label) + '</div>'
              + '</div>';
      });
      html += '</div>';
    }

    // Chart (bar)
    if (data.chart && data.chart.items && data.chart.items.length) {
      html += '<div style="margin-bottom:1.2rem;">';
      if (data.chart.title) {
        html += '<div style="font-size:.7rem;font-weight:500;margin-bottom:.6rem;color:var(--mid);letter-spacing:.08em;text-transform:uppercase;">' + escHtml(data.chart.title) + '</div>';
      }
      data.chart.items.forEach(function (item) {
        var pct = item.max ? Math.round((item.value / item.max) * 100) : item.value;
        var barColor = item.badge === 'ok' ? '#4ade80' : item.badge === 'warn' ? '#facc15' : '#f87171';
        html += '<div style="display:flex;align-items:center;gap:.6rem;margin-bottom:.45rem;">'
              + '<div style="width:80px;font-size:.65rem;color:var(--mid);text-align:right;flex-shrink:0;">' + escHtml(item.label) + '</div>'
              + '<div style="flex:1;height:18px;background:rgba(244,242,238,.06);border-radius:4px;overflow:hidden;position:relative;">'
              + '<div style="height:100%;width:' + pct + '%;background:' + barColor + ';border-radius:4px;transition:width .6s ease;"></div>'
              + '</div>'
              + '<div style="width:32px;font-size:.65rem;font-weight:600;color:var(--white);">' + escHtml(String(item.value)) + '</div>';
        if (item.badgeText) {
          html += '<span style="font-size:.5rem;padding:.15rem .4rem;border-radius:4px;' + badgeClass(item.badge) + '">' + escHtml(item.badgeText) + '</span>';
        }
        html += '</div>';
      });
      html += '</div>';
    }

    // Table
    if (data.table && data.table.headers && data.table.rows) {
      html += '<div style="overflow-x:auto;margin-bottom:1.2rem;">'
            + '<table style="width:100%;border-collapse:collapse;font-size:.7rem;">';
      html += '<thead><tr>';
      data.table.headers.forEach(function (h) {
        html += '<th style="text-align:left;padding:.5rem .6rem;border-bottom:1px solid rgba(244,242,238,.1);color:var(--mid);font-weight:500;letter-spacing:.08em;text-transform:uppercase;">' + escHtml(h) + '</th>';
      });
      html += '</tr></thead><tbody>';
      data.table.rows.forEach(function (row) {
        html += '<tr>';
        row.forEach(function (cell) {
          if (cell && typeof cell === 'object' && cell.text) {
            html += '<td style="padding:.45rem .6rem;border-bottom:1px solid rgba(244,242,238,.05);">'
                  + '<span style="font-size:.55rem;padding:.15rem .4rem;border-radius:4px;' + badgeClass(cell.badge) + '">' + escHtml(cell.text) + '</span>'
                  + '</td>';
          } else {
            html += '<td style="padding:.45rem .6rem;border-bottom:1px solid rgba(244,242,238,.05);color:var(--white);">' + escHtml(String(cell)) + '</td>';
          }
        });
        html += '</tr>';
      });
      html += '</tbody></table></div>';
    }

    // Notes
    if (data.notes && data.notes.length) {
      data.notes.forEach(function (n) {
        html += '<div style="padding:.8rem 1rem;border-radius:8px;background:rgba(250,204,21,.06);border-left:3px solid #facc15;margin-bottom:.6rem;">'
              + '<div style="font-size:.7rem;font-weight:600;color:#facc15;margin-bottom:.3rem;">' + escHtml(n.title) + '</div>'
              + '<div style="font-size:.65rem;color:var(--mid);line-height:1.6;">' + escHtml(n.text) + '</div>'
              + '</div>';
      });
    }

    $dashCont.innerHTML = html;

    // Scroll dashboard into view
    $dashboard.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  /* ── 9. Fullscreen ───────────────────────────────────── */
  var fsCloseBtn = null;
  function exitFullscreen() {
    var db = document.getElementById('pg-dashboard');
    db.classList.remove('fullscreen');
    $fullscreen.textContent = 'Tela cheia';
    if (fsCloseBtn) { fsCloseBtn.remove(); fsCloseBtn = null; }
    document.removeEventListener('keydown', fsEscHandler);
  }
  function fsEscHandler(e) {
    if (e.key === 'Escape') exitFullscreen();
  }
  $fullscreen.addEventListener('click', function () {
    var db = document.getElementById('pg-dashboard');
    if (db.classList.contains('fullscreen')) {
      exitFullscreen();
    } else {
      db.classList.add('fullscreen');
      $fullscreen.textContent = 'Sair tela cheia';
      // Create close button on body so it's above everything
      fsCloseBtn = document.createElement('button');
      fsCloseBtn.className = 'pg-fs-close';
      fsCloseBtn.textContent = 'Pressione ESC para sair da tela cheia';
      fsCloseBtn.style.display = 'block';
      fsCloseBtn.addEventListener('click', exitFullscreen);
      document.body.appendChild(fsCloseBtn);
      document.addEventListener('keydown', fsEscHandler);
    }
  });

  /* ── 10. Clear ───────────────────────────────────────── */
  $clear.addEventListener('click', function () {
    // Reset chat
    $chat.innerHTML = '';
    $chat.appendChild($empty);
    $empty.style.display = '';

    // Reset dashboard
    $dashboard.style.display = 'none';
    $dashCont.innerHTML = '';
    // pdf removed
    $fullscreen.style.display = 'none';
    $dashboard.classList.remove('fullscreen');

    // Reset CSV
    csvData = null;
    $csvFile.value = '';
    $csvText.textContent = 'Arraste um CSV aqui ou clique para importar';
    $csvZone.style.borderColor = '';

    // Reset input
    $input.value = '';
    lastUserPrompt = '';

    // Reset status
    setStatus('');
  });

  /* ── 11. Tutorial Walkthrough ────────────────────────── */
  var tutSteps = [
    { el: '.pg-config',  title: 'Configuração da IA', text: 'Aqui você configura o modelo de IA e a temperatura para a geração do dashboard.' },
    { el: '#pg-model',   title: 'Modelo',             text: 'Escolha entre os modelos disponíveis: deepseek-chat (rápido) ou deepseek-reasoner (analítico).' },
    { el: '#pg-temp',    title: 'Temperatura',         text: 'Controla a criatividade da IA. Baixo = respostas mais precisas. Alto = mais variação.' },
    { el: '#csv-zone',   title: 'Importar CSV',        text: 'Arraste ou selecione um arquivo CSV com seus dados. A IA analisa automaticamente.' },
    { el: '#pg-input',   title: 'Campo de Texto',      text: 'Descreva seus dados em linguagem natural ou complemente o CSV com instruções.' },
    { el: '#pg-send',    title: 'Gerar Dashboard',     text: 'Clique para enviar os dados para a IA e gerar o dashboard interativo.' },
    { el: '#pg-clear',   title: 'Limpar',              text: 'Limpa tudo: chat, dashboard, CSV importado e campo de texto.' }
  ];

  var tutCurrent = 0;
  var $tutOverlay   = document.getElementById('tut-overlay');
  var $tutSpotlight = document.getElementById('tut-spotlight');
  var $tutTooltip   = document.getElementById('tut-tooltip');
  var $tutStep      = document.getElementById('tut-step');
  var $tutText      = document.getElementById('tut-text');
  var $tutPrev      = document.getElementById('tut-prev');
  var $tutNext      = document.getElementById('tut-next');
  var $tutExit      = document.getElementById('tut-exit');
  var $tutClose     = document.getElementById('tut-close');
  var $tutBtn       = document.getElementById('pg-tutorial-btn');

  function showTutStep(idx) {
    if (idx < 0 || idx >= tutSteps.length) return;
    tutCurrent = idx;
    var step = tutSteps[idx];
    var target = document.querySelector(step.el);

    $tutStep.textContent = 'Passo ' + (idx + 1) + ' de ' + tutSteps.length + ' — ' + step.title;
    $tutText.textContent = step.text;

    $tutPrev.style.visibility = idx === 0 ? 'hidden' : 'visible';
    $tutNext.textContent = idx === tutSteps.length - 1 ? 'Concluir' : 'Próximo';

    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'center' });

      // Delay to let scroll settle
      setTimeout(function () {
        var rect = target.getBoundingClientRect();
        var pad = 8;

        $tutSpotlight.style.top    = (rect.top - pad) + 'px';
        $tutSpotlight.style.left   = (rect.left - pad) + 'px';
        $tutSpotlight.style.width  = (rect.width + pad * 2) + 'px';
        $tutSpotlight.style.height = (rect.height + pad * 2) + 'px';
        $tutSpotlight.style.boxShadow = '0 0 0 9999px rgba(0,0,0,.75)';

        // Position tooltip below or above depending on space
        var tooltipH = $tutTooltip.offsetHeight || 160;
        var spaceBelow = window.innerHeight - rect.bottom;
        if (spaceBelow > tooltipH + 30) {
          $tutTooltip.style.top = (rect.bottom + pad + 12) + 'px';
        } else {
          $tutTooltip.style.top = Math.max(8, rect.top - pad - tooltipH - 12) + 'px';
        }
        $tutTooltip.style.left = Math.max(12, Math.min(rect.left, window.innerWidth - 360)) + 'px';
      }, 350);
    }
  }

  function openTutorial() {
    $tutOverlay.classList.add('active');
    $tutOverlay.style.display = '';
    showTutStep(0);
  }

  function closeTutorial() {
    $tutOverlay.classList.remove('active');
    $tutOverlay.style.display = 'none';
    $tutSpotlight.style.boxShadow = 'none';
  }

  if ($tutBtn) $tutBtn.addEventListener('click', openTutorial);

  $tutNext.addEventListener('click', function () {
    if (tutCurrent >= tutSteps.length - 1) { closeTutorial(); return; }
    showTutStep(tutCurrent + 1);
  });

  $tutPrev.addEventListener('click', function () {
    showTutStep(tutCurrent - 1);
  });

  $tutExit.addEventListener('click', closeTutorial);
  $tutClose.addEventListener('click', closeTutorial);

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && $tutOverlay.classList.contains('active')) {
      closeTutorial();
    }
});
     /* ── Error modal ─────────────────────────────────────────── */
const pgErrorBtn     = document.getElementById('pg-error-btn');
const pgErrorOverlay = document.getElementById('pg-error-overlay');
const pgErrorClose   = document.getElementById('pg-error-close');

if (pgErrorBtn && pgErrorOverlay && pgErrorClose) {
  pgErrorBtn.addEventListener('click', () => {
    pgErrorOverlay.classList.add('active');
  });

  pgErrorClose.addEventListener('click', () => {
    pgErrorOverlay.classList.remove('active');
  });

  pgErrorOverlay.addEventListener('click', (e) => {
    if (e.target === pgErrorOverlay) {
      pgErrorOverlay.classList.remove('active');
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      pgErrorOverlay.classList.remove('active');
    }
  });
}

   
  /* ── 12. Chat messages ──────────────────────────────── */
  function addMsg(role, text) {
    $empty.style.display = 'none';

    var bubble = document.createElement('div');
    bubble.className = 'pg-msg pg-msg-' + role;
    bubble.style.cssText = 'padding:.6rem .9rem;border-radius:8px;margin-bottom:.5rem;font-size:.72rem;line-height:1.6;max-width:85%;white-space:pre-wrap;word-wrap:break-word;'
      + (role === 'user'
        ? 'background:rgba(244,242,238,.06);color:var(--white);align-self:flex-end;margin-left:auto;'
        : 'background:rgba(74,222,128,.06);border:1px solid rgba(74,222,128,.12);color:var(--mid);align-self:flex-start;');

    bubble.textContent = text;
    $chat.appendChild(bubble);
    $chat.scrollTop = $chat.scrollHeight;
  }

})();
