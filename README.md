# AlertaSoleira

Aviso antecipado de alagamento para lojas de rua em São Paulo: a água vai chegar na sua porta, e o comerciante fica sabendo antes.

Projeto da Global Solution 2026.2 (FIAP, Engenharia de Software, turma 1ESR), desenvolvido pela equipe Byte Force.

## Links

- Deploy (Vercel): https://alertasoleira.vercel.app
- Repositório: https://github.com/dev-cleancode/AlertaSoleira

## Sobre o projeto

Quando chove forte em São Paulo, muita loja de rua baixa alaga e o dono perde estoque. Os alertas que existem hoje, como os da Defesa Civil e dos aplicativos de mapa, são gerais: falam da cidade ou do bairro. Ninguém avisa que a água vai chegar na porta da loja em alguns minutos.

O AlertaSoleira resolve isso. Um sensor mede o nível da água na frente da loja, o sistema calcula a velocidade da subida e estima quanto tempo falta para a água chegar na soleira (a altura que a água da rua precisa alcançar para entrar na loja). O comerciante não precisa instalar nada, só receber o aviso.

Este repositório contém o site do projeto: a apresentação da ideia, o registro das lojas, o login do comerciante e a área de cada loja.

## Estados da loja

| Estado | Quando acontece |
| --- | --- |
| SEGURO | Nível baixo e estável. Nenhuma ação necessária. |
| ATENÇÃO | O nível passou de 60% da altura da soleira. |
| PERIGO | O nível passou de 85% da soleira ou faltam 30 minutos ou menos para a água chegar nela. |
| SEM LEITURAS | A loja ainda não recebeu leituras do sensor. |

A velocidade de subida é a média da variação do nível nas últimas 4 leituras. O tempo até a soleira é (altura da soleira - nível atual) dividido pela velocidade de subida. A própria loja também pode informar o status manualmente na sua área, e esse valor passa a valer no lugar do automático até voltar para "Automático (sensor)".

## Visão geral do sistema

O projeto completo tem três partes, feitas por membros diferentes da equipe:

- Sensor: ESP32 com sensor ultrassônico simulado no Wokwi, com LED e buzzer que indicam os estados mesmo sem internet.
- Central em Python: calcula a velocidade de subida e o tempo até a soleira, classifica a situação, gera os avisos e guarda tudo em JSON.
- Site (este repositório): apresenta o projeto e permite registrar lojas, entrar e acompanhar o status.

## Funcionalidades do site

- Página de apresentação com hero, introdução, problema, solução e cálculos.
- Caixa expansível com o relatório técnico de modelagem matemática (limites, derivadas e integrais).
- Registro de loja com criação de acesso (e-mail e senha).
- Login por e-mail e senha, no canto superior direito e na área do comerciante no rodapé. Navegar pelo site não exige login.
- Lista pública de lojas com status, nível atual, velocidade de subida, tempo até a soleira, orientação e último aviso.
- Área da loja em /loja/[id], restrita ao dono: ver o status, informar o status manualmente, editar os dados, consultar leituras e avisos e excluir a loja.
- Rolagem suave nos links de navegação e animações ao passar o mouse nos cards.

## Requisitos

### Requisitos funcionais

- Apresentar o projeto (problema, solução e estados da loja).
- Permitir registrar uma loja com nome, bairro, altura da soleira (1 a 50 cm), WhatsApp com DDD, e-mail e senha (mínimo de 6 caracteres).
- Não permitir dois registros com o mesmo e-mail.
- Permitir login com e-mail e senha e manter a sessão no navegador.
- Listar as lojas com o status calculado a partir das leituras.
- Restringir a área /loja/[id] ao comerciante dono daquele id.
- Permitir ao comerciante editar os dados da loja, informar o status e excluir a loja.
- Mostrar o relatório de cálculo em uma caixa que abre e fecha.

### Requisitos não funcionais

- Layout responsivo, pensado primeiro para telas pequenas (mobile-first).
- Consumo de API REST com axios.
- Senha guardada como hash SHA-256 (e-mail e senha combinados), nunca em texto puro.
- Código em JavaScript (sem TypeScript), componentes em arrow function.
- O sensor funciona sem internet (LED e buzzer), como pede o briefing.

### Requisitos para rodar

- Node.js e npm instalados.
- Conexão com a internet para acessar a API.
- Acesso por https ou localhost, porque o hash da senha usa a API de criptografia do navegador.

## Tecnologias

- Next.js (App Router) e React
- Tailwind CSS
- axios
- MockAPI
- Vercel (deploy)
- Python (central de cálculo, em outro repositório da equipe)
- ESP32 e Wokwi (sensor)

## Estrutura de pastas

```
public/
└── imagens/
src/
├── app/
│   ├── components/
│   │   ├── CampoFormulario.js
│   │   ├── CardLoja.js
│   │   ├── Footer.js
│   │   ├── Header.js
│   │   └── LoginForm.js
│   ├── context/
│   │   └── AuthContext.js
│   ├── loja/
│   │   └── [id]/
│   │       └── page.js
│   ├── globals.css
│   ├── layout.js
│   └── page.js
├── services/
│   └── api.js
└── utils/
    ├── calculos.js
    ├── hash.js
    └── lojas.js
```

## API

Os dados ficam em uma API no MockAPI, recurso `lojas`:

https://6ae9fb193d3dd3d37be5fdad.mockapi.io/lojas

| Campo | Tipo | Descrição |
| --- | --- | --- |
| id | String | Gerado pelo MockAPI. É o id usado na rota /loja/[id]. |
| nome | String | Nome da loja. |
| bairro | String | Bairro da loja. |
| soleira | Number | Altura da soleira em cm (1 a 50). |
| telefone | String | WhatsApp com DDD, usado para os avisos. |
| email | String | E-mail de acesso do comerciante. |
| senhaHash | String | Hash SHA-256 de e-mail e senha. |
| statusManual | String | Status informado pela loja. Vazio significa automático. |
| leituras | Array | Lista de objetos com minuto e nivel (cm). |
| avisos | Array | Lista de objetos com minuto e mensagem. |

Operações usadas: GET, POST, PUT e DELETE em `/lojas`.

## Modelo matemático

O relatório técnico da disciplina Differentiated Problem Solving modela o nível da água na rua durante uma chuva forte (período de retorno de 10 anos) e usa limites, derivadas e integrais:

- A intensidade da chuva vem da equação de chuvas intensas do posto IAG - Parque do Estado, e o nível da água segue h(t) = H (1 - e^(-Ct)).
- A derivada h'(t) é a velocidade de subida da água. Ela começa em 0,601 cm/min e chega à soleira com 0,20 cm/min.
- Para uma soleira de 20 cm, a água chega após 54,8 min. Para o comerciante ter 30 min para reagir, o alerta precisa sair aos 24,8 min, quando o nível ainda é de 11,8 cm.
- Os valores 0,6 cm/mm e 0,02 por min são hipóteses, não foram medidos. Calibrá-los com o sensor é o principal próximo passo.

O relatório completo pode ser aberto na seção "A matemática por trás do aviso" do site.

## Como rodar o projeto

```
npm install
npm run dev
```

Depois acesse http://localhost:3000.

Para gerar a versão de produção:

```
npm run build
npm start
```

## Observações

- A API do MockAPI é aberta: qualquer pessoa com a URL consegue ler e alterar os dados. A restrição da área da loja é feita só na interface, e o hash da senha serve para este projeto acadêmico, não para produção.
- As fotos do site ficam em public/imagens e devem ter os créditos informados na apresentação.

## Equipe

Byte Force

| RM | Nome |
| --- | --- |
| 570881 | Gabriel Freitas da Silva Carvalho |
| 572892 | Erick Martins Picolo |
| 572171 | Guilherme Marcon Dantas |
| 569782 | Luiz Felipe Cardoso de Oliveira |
