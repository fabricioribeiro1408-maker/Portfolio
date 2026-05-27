# Fabricio Ribeiro — Portfolio Interativo

> Customer Success & AI Specialist | 5+ anos em CS/CX | B2B & B2G Enterprise

Portfolio profissional interativo com tema dark premium, construído com HTML, CSS e JavaScript puro — sem frameworks, sem dependências, sem complexidade desnecessária.

**[Ver Portfolio →](#)** *(deploy via GitHub Pages)*

---

## Sobre o Projeto

Este portfolio foi criado para apresentar minha trajetória como especialista em Customer Success, Suporte N2 e Inteligência Artificial aplicada, de forma que o próprio site demonstre na prática as competências que descrevo — dados, tecnologia e resultado real.

O diferencial não está em qual framework foi usado, mas em **como** foi usado. Cada interação, efeito visual e funcionalidade foi pensada para comunicar algo sobre meu perfil profissional.

---

## Transparência & Filosofia Técnica

Sou um profissional de Customer Success e Ciência de Dados — **não sou programador de formação**. Essa distinção é importante e faço questão de ser transparente sobre ela.

### Por que HTML, CSS e JavaScript puro?

Escolhi deliberadamente trabalhar apenas com tecnologias que conheço e entendo na prática:

- **HTML5** — estrutura semântica que eu consigo ler, editar e manter sozinho
- **CSS3** — estilização com custom properties, grid, flexbox, animações e media queries
- **JavaScript Vanilla** — sem React, Vue, Angular ou qualquer framework. Código que eu compreendo linha por linha

Não seria honesto usar um framework que eu não domino só para impressionar. A escolha por tecnologias "comuns" é proposital — demonstra que resultados premium não exigem stacks complexas, exigem clareza de propósito.

### Sobre o uso de IA na construção

Este portfolio foi integralmente construído com o auxílio do **Claude (Anthropic)** — a melhor IA do mercado para programação. Cada linha de código foi gerada em parceria com a IA, e eu não tenho nenhum problema em dizer isso.

Por quê? Porque:

1. **Eu sei o que quero** — a visão estratégica, os textos, a estrutura, as decisões de negócio são minhas
2. **Eu sei validar** — consigo testar, identificar bugs e pedir correções com precisão
3. **Não fujo do meu escopo** — não finjo ser fullstack. Uso IA para potencializar o que sei, não para ser o que não sou
4. **A IA é ferramenta, não autor** — assim como um designer usa Figma e um analista usa Excel, eu uso Claude para codificar

Essa é a mesma filosofia que aplico no trabalho: usar Inteligência Artificial de forma honesta, prática e orientada a resultado.

---

## Estrutura do Projeto

```
portfolio/
├── index.html          # Página principal (todas as seções)
├── css/
│   └── style.css       # Estilos completos (~2800 linhas)
├── js/
│   ├── main.js         # Efeitos visuais, animações, scroll
│   ├── playground.js   # AI Dashboard (DeepSeek API)
│   └── terminal.js     # Terminal interativo + jogos
├── src/                # Imagens dos projetos (cases)
└── README.md           # Este arquivo
```

---

## Seções do Portfolio

### 1. Preloader & Scroll Progress
Tela de carregamento com logo "FR" e barra de progresso animada. Barra de progresso no topo acompanha o scroll da página em tempo real.

### 2. Hero
Apresentação principal com foto, título, subtítulo e CTAs. Inclui contadores animados (5+ anos, N2, B2B & B2G, AI) e efeito de spotlight que segue o cursor.

### 3. Code Marquee
Faixa horizontal com código real de CS rolando continuamente — queries SQL, scripts Python de predição de churn, métricas de SLA. Reforça o perfil técnico-analítico.

### 4. Sobre (// 01)
Três parágrafos que resumem minha trajetória, citação de Kant, e quatro pilares de atuação em cards com efeito glow:
- Gestão de Carteiras & SLA
- Otimização Data-Driven com IA
- Interface Técnica & Stakeholders
- Suporte N2 & SLA Crítico

### 5. Terminal Interativo
Terminal bash funcional com comandos reais que navegam pelo site:

| Comando | Descrição |
|---------|-----------|
| `help` | Lista de comandos |
| `about` | Navega para Sobre |
| `exp` | Experiência profissional |
| `skills` | Competências |
| `education` | Formação acadêmica |
| `reputation` | Reputação & Impacto |
| `cases` | Cases & Projetos |
| `snake` | Jogo da Cobrinha (temática CS) |

| `memory` | Jogo da Memória (termos de CS) |
| `matrix` | Efeito Matrix Rain |
| `neural` | Rede neural animada interativa |
| `shutdown` | Easter egg destrutivo |
| `clear` | Limpar terminal |

### 6. Experiência (// 02)
Quatro posições profissionais em cards expansíveis com tags de competência, datas e bullets detalhados:
- **Brisanet Telecomunicações** — CS & Suporte N2 Pleno (atual)
- **Brisanet Telecomunicações** — CS & Suporte N1 Jr
- **Brisanet Telecomunicações** — Operador de Suporte Técnico
- **Infraline Telecomunicações** — Analista de Infraestrutura e Experiência do Cliente

### 7. Painel de Código (IA Aplicada)
Split layout com código Python real de predição de churn à esquerda e simulação de terminal executando inference à direita. Demonstra aplicação prática de IA no workflow de CS.

### 8. Competências (// 03)
Três colunas de skills com barras de progresso animadas:
- **Customer Success & CX** — Churn, Health Score, SLA, B2B/B2G, CRM
- **IA & Dados** — AI Prompting, Python, SQL, Dashboards, Automação
- **Suporte N2** — SQL & Data Querying, Log Analysis, CRM, Networks, ITIL

Grid de stack completa com todas as tecnologias e metodologias.

### 9. Formação (// 04)
Três formações com heading sticky no scroll:
- MBA em Gestão Tecnológica — Big Data & IA (cursando)
- Graduação em Data Science (concluído)
- 2ª Graduação em Análise e Desenvolvimento de Sistemas (cursando)

### 10. Reputação & Impacto (// 05)
Três depoimentos reais do LinkedIn com fotos, cargos e perspectivas distintas:
- Perspectiva de Negócio & Operação
- Perspectiva Técnica
- Perspectiva de Liderança

### 11. Cases & Projetos (// 06)
Quatro cards de projetos reais com imagens, tags e stacks:
- AI Dashboard Playground
- Chatbot de Atendimento
- FR Controle (CRM)
- HIK-Inteligente (Câmeras IoT)

### 12. AI Playground (// 07)
**A funcionalidade mais estratégica do portfolio.** Dashboard interativo que demonstra na prática o uso de IA aplicada a CS:

- **Motor de IA**: integração real com DeepSeek API (deepseek-chat / deepseek-reasoner)
- **Geração de dashboards**: o usuário descreve dados em linguagem natural e a IA gera um dashboard completo com KPIs, gráficos de barras, tabelas e notas estratégicas
- **Dados de exemplo**: três cenários pré-configurados (Carteira de Clientes, Análise de SLA, Performance da Equipe)
- **Importação CSV**: drag-and-drop de arquivos CSV para análise
- **Modo demo**: dashboard pré-renderizado para demonstração offline
- **Tela cheia**: visualização expandida com ESC para sair
- **Rate limiting**: 1 dashboard por minuto para controle de custos
- **Galeria**: mini-previews de dashboards gerados
- **Tutorial**: walkthrough interativo de 7 passos explicando cada funcionalidade

### 13. Contato (// 08)
Layout com formulário de contato, e-mail, LinkedIn e localização.

---

## Efeitos Visuais & Interações

| Efeito | Descrição |
|--------|-----------|
| **Preloader** | Tela de loading com barra de progresso |
| **Scroll Progress** | Barra no topo que acompanha o scroll |
| **Custom Cursor** | Cursor personalizado com dot + ring (desktop) |
| **Partículas Canvas** | Partículas flutuantes no background |
| **Gradient Glow** | Cards que brilham seguindo o cursor |
| **Tilt 3D** | Cards que inclinam com perspectiva ao hover |
| **Magnetic Buttons** | Botões que são "atraídos" pelo cursor |
| **Mask Reveal** | Headings revelados com clip-path no scroll |
| **Glitch Effect** | Efeito glitch no nome do hero ao carregar |
| **Hero Spotlight** | Gradiente radial que segue o mouse no hero |
| **Count-Up** | Números animados com contagem progressiva |
| **Animated Border** | Borda com gradiente cônico rotativo no config |
| **Code Marquee** | Código real rolando horizontalmente |
| **Neural Network** | Rede neural animada com glow interativo ao mouse |

---

## Stack Técnica

| Camada | Tecnologia |
|--------|-----------|
| **Estrutura** | HTML5 semântico |
| **Estilização** | CSS3 (Custom Properties, Grid, Flexbox, Animations, Clip-path, Media Queries) |
| **Interatividade** | JavaScript Vanilla (ES6+) |
| **IA Integrada** | DeepSeek API (chat + reasoner) |
| **Fontes** | Google Fonts (Cormorant Garamond, DM Mono, Figtree) |
| **SEO** | Open Graph, Twitter Cards, meta tags |
| **Responsividade** | Mobile-first com breakpoints em 768px e 480px |
| **Deploy** | GitHub Pages (estático, sem servidor) |
| **Desenvolvimento** | Claude (Anthropic) — IA para geração de código |

---

## Como Rodar Localmente

1. Clone o repositório:
```bash
git clone https://github.com/seu-usuario/portfolio.git
```

2. Abra `index.html` no navegador:
```bash
cd portfolio
# Abra index.html diretamente ou use um servidor local:
python -m http.server 8000
```

3. Acesse `http://localhost:8000`

> **Nota:** A funcionalidade do AI Playground requer conexão com internet para acessar a API do DeepSeek.

---

## Responsividade

O portfolio é totalmente responsivo com dois breakpoints principais:

- **Tablet (≤768px)**: layouts em coluna única, nav compacto, grids adaptados
- **Mobile (≤480px)**: fontes reduzidas, espaçamentos otimizados, cursor nativo restaurado

---

## Licença

Este projeto é de uso pessoal. O código pode ser usado como referência, mas o conteúdo (textos, imagens, depoimentos) é propriedade de Fabricio Ribeiro.

---

<p align="center">
  <strong>Fabricio Ribeiro</strong><br>
  Customer Success & AI Specialist<br>
  Pau dos Ferros — RN, Brasil<br><br>
  <a href="mailto:fabricioribeiro1408@gmail.com">fabricioribeiro1408@gmail.com</a> · 
  <a href="https://www.linkedin.com/in/fabricioribeiro-7013363ab">LinkedIn</a>
</p>
