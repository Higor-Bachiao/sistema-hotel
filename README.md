# Sistema de Gerenciamento Hoteleiro

Um sistema completo de gerenciamento hoteleiro desenvolvido com Next.js 15, React e Tailwind CSS.

## 🚀 Funcionalidades

### ✅ Implementadas
- **Autenticação JWT** - Login e registro de usuários
- **Dashboard Responsivo** - Interface adaptável para desktop, tablet e mobile
- **Gerenciamento de Quartos** - Visualização, adição, edição e exclusão
- **Sistema de Reservas** - Reserva online com confirmação
- **Filtros Avançados** - Por tipo, status, preço e disponibilidade
- **Estatísticas** - Gráficos de ocupação e métricas do hotel
- **Painel Administrativo** - CRUD completo para administradores
- **Status de Quartos** - Disponível, ocupado, manutenção, reservado

### 🔄 Em Desenvolvimento
- **Integração com Backend** - API REST com Node.js e Express
- **Banco de Dados** - MySQL com Sequelize ORM
- **Envio de E-mails** - Confirmação automática de reservas
- **Integração WhatsApp** - Chatbot para atendimento
- **Google Maps** - Localização do hotel
- **PWA** - Progressive Web App
- **Testes Unitários** - Jest e Testing Library

## 🛠️ Tecnologias Utilizadas

### Frontend
- **Next.js 15** - Framework React com App Router
- **React 18** - Biblioteca para interfaces de usuário
- **TypeScript** - Tipagem estática
- **Tailwind CSS** - Framework CSS utilitário
- **Shadcn/ui** - Componentes de interface
- **Recharts** - Gráficos e visualizações
- **Lucide React** - Ícones modernos

### Backend (Planejado)
- **Node.js** - Runtime JavaScript
- **Express** - Framework web
- **Sequelize** - ORM para MySQL
- **JWT** - Autenticação
- **bcrypt** - Hash de senhas
- **Helmet** - Segurança HTTP

## 📁 Estrutura do Projeto

\`\`\`
hotel-management-system/
├── app/                    # App Router do Next.js
│   ├── globals.css        # Estilos globais
│   ├── layout.tsx         # Layout principal
│   └── page.tsx           # Página inicial
├── components/            # Componentes React
│   ├── admin/            # Painel administrativo
│   ├── auth/             # Autenticação
│   ├── dashboard/        # Dashboard e estatísticas
│   ├── layout/           # Layout e navegação
│   ├── reservations/     # Sistema de reservas
│   ├── rooms/            # Gerenciamento de quartos
│   └── ui/               # Componentes de interface
├── contexts/             # Context API
│   ├── auth-context.tsx  # Contexto de autenticação
│   └── hotel-context.tsx # Contexto do hotel
├── types/                # Definições TypeScript
│   └── hotel.ts          # Tipos do sistema
└── README.md             # Documentação
\`\`\`

## 🚀 Como Executar

### Pré-requisitos
- Node.js 18+ 
- npm ou yarn

### Instalação

1. **Clone o repositório**
\`\`\`bash
git clone https://github.com/seu-usuario/hotel-management-system.git
cd hotel-management-system
\`\`\`

2. **Instale as dependências**
\`\`\`bash
npm install
# ou
yarn install
\`\`\`

3. **Execute o projeto**
\`\`\`bash
npm run dev
# ou
yarn dev
\`\`\`

4. **Acesse o sistema**
\`\`\`
http://localhost:3000
\`\`\`

### Credenciais de Teste
- **Administrador**: admin@hotel.com / admin123
- **Funcionário**: staff@hotel.com / staff123

## 📱 Responsividade

O sistema foi desenvolvido com design responsivo, funcionando perfeitamente em:
- **Desktop** (1200px+)
- **Tablet** (768px - 1199px)
- **Mobile** (320px - 767px)

## 🔐 Segurança

### Implementadas
- Autenticação JWT
- Validação de formulários
- Sanitização de dados
- Controle de acesso por roles

### Planejadas
- HTTPS obrigatório
- Rate limiting
- Validação de entrada
- Proteção CSRF
- Headers de segurança

## 📊 Funcionalidades Principais

### Gerenciamento de Quartos
- Visualização em grid responsivo
- Filtros por tipo, status e preço
- Busca por número ou hóspede
- Status colorido (verde=disponível, vermelho=ocupado)
- Detalhes completos do quarto

### Sistema de Reservas
- Formulário intuitivo
- Seleção de quartos disponíveis
- Validação de datas
- Confirmação automática

### Dashboard Administrativo
- Estatísticas em tempo real
- Gráficos de ocupação
- Métricas de receita
- Controle de usuários

### Painel de Estatísticas
- Taxa de ocupação
- Receita mensal
- Distribuição por tipo de quarto
- Hóspedes ativos

## 🧪 Testes

\`\`\`bash
# Executar testes
npm run test

# Executar testes em modo watch
npm run test:watch

# Verificação de tipos
npm run type-check
\`\`\`

## 📦 Deploy

### Vercel (Recomendado)
\`\`\`bash
# Instalar Vercel CLI
npm i -g vercel

# Deploy
vercel
\`\`\`

### Docker
\`\`\`bash
# Build da imagem
docker build -t hotel-management .

# Executar container
docker run -p 3000:3000 hotel-management
\`\`\`

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para detalhes.

## 📞 Suporte

Para suporte e dúvidas:
- Email: suporte@hotelmanagement.com
- WhatsApp: (11) 99999-9999
- GitHub Issues: [Criar Issue](https://github.com/seu-usuario/hotel-management-system/issues)

## 🗺️ Roadmap

### Versão 2.0
- [ ] Integração com APIs de pagamento
- [ ] Sistema de avaliações
- [ ] Relatórios avançados
- [ ] Integração com Google Maps
- [ ] Notificações push

### Versão 3.0
- [ ] App mobile nativo
- [ ] IA para previsão de ocupação
- [ ] Integração com sistemas externos
- [ ] Multi-idiomas
- [ ] Tema escuro

---

Desenvolvido com ❤️ pela equipe Hotel Management
