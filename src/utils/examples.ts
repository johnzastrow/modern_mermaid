import type { Language } from './i18n';

export interface Example {
  id: string;
  name: {
    [key in Language]: string;
  };
  code: {
    [key in Language]: string;
  };
}

export const exampleCategories = {
  flowchart: 'flowchart',
  sequence: 'sequence',
  class: 'class',
  state: 'state',
  er: 'er',
  gantt: 'gantt',
  pie: 'pie',
  git: 'git',
  chart: 'chart',
  journey: 'journey',
  mindmap: 'mindmap',
  timeline: 'timeline',
  quadrant: 'quadrant',
  requirement: 'requirement',
  c4: 'c4',
  sankey: 'sankey',
  block: 'block',
  architecture: 'architecture',
  kanban: 'kanban',
  packet: 'packet',
  radar: 'radar',
  treemap: 'treemap',
  venn: 'venn',
  swimlane: 'swimlane',
  wardley: 'wardley',
  cynefin: 'cynefin',
  ishikawa: 'ishikawa',
  info: 'info',
  railroadEbnf: 'railroadEbnf',
  railroadAbnf: 'railroadAbnf',
  railroadPeg: 'railroadPeg',
} as const;

export type ExampleCategory = keyof typeof exampleCategories;

export const examples: Record<ExampleCategory, Example[]> = {
  flowchart: [
    {
      id: 'flowchart-login',
      name: {
        'en': 'User Login Flow',
        'zh-CN': '用户登录流程',
        'zh-TW': '用戶登入流程',
        'ja': 'ユーザーログインフロー',
        'es': 'Flujo de inicio de sesión',
        'pt': 'Fluxo de login do usuário',
      },
      code: {
        'en': `flowchart TD
    Start([Start]) --> Input[Enter Username & Password]
    Input --> Validate{Validate Info}
    Validate -->|Valid| CheckDB[Check Database]
    Validate -->|Invalid| Error1[Display Error]
    Error1 --> Input
    CheckDB --> Match{Match Found?}
    Match -->|Yes| Success[Login Success]
    Match -->|No| Error2[Invalid Credentials]
    Error2 --> Input
    Success --> Dashboard[Go to Dashboard]
    Dashboard --> End([End])`,
        'zh-CN': `flowchart TD
    Start([开始]) --> Input[输入用户名和密码]
    Input --> Validate{验证信息}
    Validate -->|有效| CheckDB[检查数据库]
    Validate -->|无效| Error1[显示错误信息]
    Error1 --> Input
    CheckDB --> Match{匹配成功?}
    Match -->|是| Success[登录成功]
    Match -->|否| Error2[用户名或密码错误]
    Error2 --> Input
    Success --> Dashboard[跳转到仪表板]
    Dashboard --> End([结束])`,
        'zh-TW': `flowchart TD
    Start([開始]) --> Input[輸入使用者名稱和密碼]
    Input --> Validate{驗證資訊}
    Validate -->|有效| CheckDB[檢查資料庫]
    Validate -->|無效| Error1[顯示錯誤訊息]
    Error1 --> Input
    CheckDB --> Match{匹配成功?}
    Match -->|是| Success[登入成功]
    Match -->|否| Error2[使用者名稱或密碼錯誤]
    Error2 --> Input
    Success --> Dashboard[跳轉到儀表板]
    Dashboard --> End([結束])`,
        'ja': `flowchart TD
    Start([スタート]) --> Input[ユーザー名とパスワードを入力]
    Input --> Validate{情報を検証}
    Validate -->|有効| CheckDB[データベースを確認]
    Validate -->|無効| Error1[エラーを表示]
    Error1 --> Input
    CheckDB --> Match{一致?}
    Match -->|はい| Success[ログイン成功]
    Match -->|いいえ| Error2[認証情報が無効]
    Error2 --> Input
    Success --> Dashboard[ダッシュボードへ]
    Dashboard --> End([終了])`,
        'es': `flowchart TD
    Start([Inicio]) --> Input[Ingresar Usuario y Contraseña]
    Input --> Validate{Validar Información}
    Validate -->|Válido| CheckDB[Verificar Base de Datos]
    Validate -->|Inválido| Error1[Mostrar Error]
    Error1 --> Input
    CheckDB --> Match{¿Coincidencia?}
    Match -->|Sí| Success[Inicio Exitoso]
    Match -->|No| Error2[Credenciales Inválidas]
    Error2 --> Input
    Success --> Dashboard[Ir al Panel]
    Dashboard --> End([Fin])`,
        'pt': `flowchart TD
    Start([Início]) --> Input[Inserir Usuário e Senha]
    Input --> Validate{Validar Informação}
    Validate -->|Válido| CheckDB[Verificar Banco de Dados]
    Validate -->|Inválido| Error1[Mostrar Erro]
    Error1 --> Input
    CheckDB --> Match{Correspondência?}
    Match -->|Sim| Success[Login Bem-sucedido]
    Match -->|Não| Error2[Credenciais Inválidas]
    Error2 --> Input
    Success --> Dashboard[Ir para o Painel]
    Dashboard --> End([Fim])`,
      },
    },
    {
      id: 'flowchart-simple',
      name: {
        'en': 'Simple Decision Tree',
        'zh-CN': '简单决策树',
        'zh-TW': '簡單決策樹',
        'ja': 'シンプル判断ツリー',
        'es': 'Árbol de decisión simple',
        'pt': 'Árvore de decisão simples',
      },
      code: {
        'en': `graph TD
    A[Start] --> B{Is it working?}
    B -->|Yes| C[Great!]
    B -->|No| D[Debug]
    D --> E[Fix issue]
    E --> B
    C --> F[End]`,
        'zh-CN': `graph TD
    A[开始] --> B{工作正常吗?}
    B -->|是| C[太好了!]
    B -->|否| D[调试]
    D --> E[修复问题]
    E --> B
    C --> F[结束]`,
        'zh-TW': `graph TD
    A[開始] --> B{工作正常嗎?}
    B -->|是| C[太好了!]
    B -->|否| D[除錯]
    D --> E[修復問題]
    E --> B
    C --> F[結束]`,
        'ja': `graph TD
    A[スタート] --> B{動作していますか?}
    B -->|はい| C[素晴らしい!]
    B -->|いいえ| D[デバッグ]
    D --> E[問題を修正]
    E --> B
    C --> F[終了]`,
        'es': `graph TD
    A[Inicio] --> B{¿Funciona?}
    B -->|Sí| C[¡Genial!]
    B -->|No| D[Depurar]
    D --> E[Solucionar problema]
    E --> B
    C --> F[Fin]`,
        'pt': `graph TD
    A[Início] --> B{Está funcionando?}
    B -->|Sim| C[Ótimo!]
    B -->|Não| D[Depurar]
    D --> E[Corrigir problema]
    E --> B
    C --> F[Fim]`,
      },
    },
  ],
  sequence: [
    {
      id: 'sequence-payment',
      name: {
        'en': 'Online Payment Process',
        'zh-CN': '在线支付流程',
        'zh-TW': '線上支付流程',
        'ja': 'オンライン決済プロセス',
        'es': 'Proceso de pago en línea',
        'pt': 'Processo de pagamento online',
      },
      code: {
        'en': `sequenceDiagram
    participant User
    participant Website
    participant PaymentGateway
    participant Bank

    User->>Website: Select items & checkout
    Website->>User: Show payment page
    User->>Website: Enter payment info
    Website->>PaymentGateway: Send payment request
    PaymentGateway->>Bank: Verify payment info
    
    alt Payment successful
        Bank-->>PaymentGateway: Authorization success
        PaymentGateway-->>Website: Payment confirmed
        Website-->>User: Show success message
    else Payment failed
        Bank-->>PaymentGateway: Authorization failed
        PaymentGateway-->>Website: Payment failed
        Website-->>User: Show error message
    end`,
        'zh-CN': `sequenceDiagram
    participant 用户
    participant 网站
    participant 支付网关
    participant 银行

    用户->>网站: 选择商品并结账
    网站->>用户: 显示支付页面
    用户->>网站: 输入支付信息
    网站->>支付网关: 发送支付请求
    支付网关->>银行: 验证支付信息
    
    alt 支付成功
        银行-->>支付网关: 授权成功
        支付网关-->>网站: 支付确认
        网站-->>用户: 显示支付成功
    else 支付失败
        银行-->>支付网关: 授权失败
        支付网关-->>网站: 支付失败
        网站-->>用户: 显示错误信息
    end`,
        'zh-TW': `sequenceDiagram
    participant 使用者
    participant 網站
    participant 支付閘道
    participant 銀行

    使用者->>網站: 選擇商品並結帳
    網站->>使用者: 顯示支付頁面
    使用者->>網站: 輸入支付資訊
    網站->>支付閘道: 發送支付請求
    支付閘道->>銀行: 驗證支付資訊
    
    alt 支付成功
        銀行-->>支付閘道: 授權成功
        支付閘道-->>網站: 支付確認
        網站-->>使用者: 顯示支付成功
    else 支付失敗
        銀行-->>支付閘道: 授權失敗
        支付閘道-->>網站: 支付失敗
        網站-->>使用者: 顯示錯誤訊息
    end`,
        'ja': `sequenceDiagram
    participant ユーザー
    participant ウェブサイト
    participant 決済ゲートウェイ
    participant 銀行

    ユーザー->>ウェブサイト: 商品を選択してチェックアウト
    ウェブサイト->>ユーザー: 決済ページを表示
    ユーザー->>ウェブサイト: 決済情報を入力
    ウェブサイト->>決済ゲートウェイ: 決済リクエストを送信
    決済ゲートウェイ->>銀行: 決済情報を確認
    
    alt 決済成功
        銀行-->>決済ゲートウェイ: 承認成功
        決済ゲートウェイ-->>ウェブサイト: 決済確認
        ウェブサイト-->>ユーザー: 成功メッセージを表示
    else 決済失敗
        銀行-->>決済ゲートウェイ: 承認失敗
        決済ゲートウェイ-->>ウェブサイト: 決済失敗
        ウェブサイト-->>ユーザー: エラーメッセージを表示
    end`,
        'es': `sequenceDiagram
    participant Usuario
    participant Sitio Web
    participant Pasarela de Pago
    participant Banco

    Usuario->>Sitio Web: Seleccionar artículos y pagar
    Sitio Web->>Usuario: Mostrar página de pago
    Usuario->>Sitio Web: Ingresar información de pago
    Sitio Web->>Pasarela de Pago: Enviar solicitud de pago
    Pasarela de Pago->>Banco: Verificar información de pago
    
    alt Pago exitoso
        Banco-->>Pasarela de Pago: Autorización exitosa
        Pasarela de Pago-->>Sitio Web: Pago confirmado
        Sitio Web-->>Usuario: Mostrar mensaje de éxito
    else Pago fallido
        Banco-->>Pasarela de Pago: Autorización fallida
        Pasarela de Pago-->>Sitio Web: Pago fallido
        Sitio Web-->>Usuario: Mostrar mensaje de error
    end`,
        'pt': `sequenceDiagram
    participant Usuário
    participant Site
    participant Gateway de Pagamento
    participant Banco

    Usuário->>Site: Selecionar itens e finalizar
    Site->>Usuário: Mostrar página de pagamento
    Usuário->>Site: Inserir informações de pagamento
    Site->>Gateway de Pagamento: Enviar solicitação de pagamento
    Gateway de Pagamento->>Banco: Verificar informações de pagamento
    
    alt Pagamento bem-sucedido
        Banco-->>Gateway de Pagamento: Autorização bem-sucedida
        Gateway de Pagamento-->>Site: Pagamento confirmado
        Site-->>Usuário: Mostrar mensagem de sucesso
    else Pagamento falhado
        Banco-->>Gateway de Pagamento: Autorização falhada
        Gateway de Pagamento-->>Site: Pagamento falhado
        Site-->>Usuário: Mostrar mensagem de erro
    end`,
      },
    },
    {
      id: 'sequence-api',
      name: {
        'en': 'API Authentication',
        'zh-CN': 'API 认证流程',
        'zh-TW': 'API 認證流程',
        'ja': 'API認証',
        'es': 'Autenticación de API',
        'pt': 'Autenticação de API',
      },
      code: {
        'en': `sequenceDiagram
    actor User
    participant Client
    participant API
    participant Database

    User->>Client: Enter credentials
    Client->>API: POST /auth/login
    API->>Database: Query user
    Database-->>API: User data
    
    alt Valid credentials
        API->>API: Generate JWT token
        API-->>Client: 200 OK + Token
        Client-->>User: Login successful
    else Invalid credentials
        API-->>Client: 401 Unauthorized
        Client-->>User: Show error
    end`,
        'zh-CN': `sequenceDiagram
    actor 用户
    participant 客户端
    participant API
    participant 数据库

    用户->>客户端: 输入凭证
    客户端->>API: POST /auth/login
    API->>数据库: 查询用户
    数据库-->>API: 用户数据
    
    alt 凭证有效
        API->>API: 生成JWT令牌
        API-->>客户端: 200 OK + 令牌
        客户端-->>用户: 登录成功
    else 凭证无效
        API-->>客户端: 401 未授权
        客户端-->>用户: 显示错误
    end`,
        'zh-TW': `sequenceDiagram
    actor 使用者
    participant 客戶端
    participant API
    participant 資料庫

    使用者->>客戶端: 輸入憑證
    客戶端->>API: POST /auth/login
    API->>資料庫: 查詢使用者
    資料庫-->>API: 使用者資料
    
    alt 憑證有效
        API->>API: 生成JWT令牌
        API-->>客戶端: 200 OK + 令牌
        客戶端-->>使用者: 登入成功
    else 憑證無效
        API-->>客戶端: 401 未授權
        客戶端-->>使用者: 顯示錯誤
    end`,
        'ja': `sequenceDiagram
    actor ユーザー
    participant クライアント
    participant API
    participant データベース

    ユーザー->>クライアント: 認証情報を入力
    クライアント->>API: POST /auth/login
    API->>データベース: ユーザーを照会
    データベース-->>API: ユーザーデータ
    
    alt 認証情報が有効
        API->>API: JWTトークンを生成
        API-->>クライアント: 200 OK + トークン
        クライアント-->>ユーザー: ログイン成功
    else 認証情報が無効
        API-->>クライアント: 401 未認証
        クライアント-->>ユーザー: エラーを表示
    end`,
        'es': `sequenceDiagram
    actor Usuario
    participant Cliente
    participant API
    participant Base de Datos

    Usuario->>Cliente: Ingresar credenciales
    Cliente->>API: POST /auth/login
    API->>Base de Datos: Consultar usuario
    Base de Datos-->>API: Datos del usuario
    
    alt Credenciales válidas
        API->>API: Generar token JWT
        API-->>Cliente: 200 OK + Token
        Cliente-->>Usuario: Inicio exitoso
    else Credenciales inválidas
        API-->>Cliente: 401 No autorizado
        Cliente-->>Usuario: Mostrar error
    end`,
        'pt': `sequenceDiagram
    actor Usuário
    participant Cliente
    participant API
    participant Banco de Dados

    Usuário->>Cliente: Inserir credenciais
    Cliente->>API: POST /auth/login
    API->>Banco de Dados: Consultar usuário
    Banco de Dados-->>API: Dados do usuário
    
    alt Credenciais válidas
        API->>API: Gerar token JWT
        API-->>Cliente: 200 OK + Token
        Cliente-->>Usuário: Login bem-sucedido
    else Credenciais inválidas
        API-->>Cliente: 401 Não autorizado
        Cliente-->>Usuário: Mostrar erro
    end`,
      },
    },
  ],
  class: [
    {
      id: 'class-ecommerce',
      name: {
        'en': 'E-commerce System',
        'zh-CN': '电商系统',
        'zh-TW': '電商系統',
        'ja': 'Eコマースシステム',
        'es': 'Sistema de comercio electrónico',
        'pt': 'Sistema de comércio eletrônico',
      },
      code: {
        'en': `classDiagram
    class User {
        +int userId
        +string username
        +string email
        +login()
        +register()
        +updateProfile()
    }
    
    class Product {
        +int productId
        +string name
        +decimal price
        +int stock
        +updateStock()
        +getDetails()
    }
    
    class Order {
        +int orderId
        +datetime createdAt
        +decimal total
        +string status
        +createOrder()
        +cancelOrder()
    }
    
    class Cart {
        +int cartId
        +addProduct()
        +removeProduct()
        +clear()
        +calculateTotal()
    }
    
    User "1" --> "0..*" Order : places
    User "1" --> "1" Cart : owns
    Order "1" --> "1..*" Product : contains
    Cart "1" --> "0..*" Product : contains`,
        'zh-CN': `classDiagram
    class 用户 {
        +int 用户ID
        +string 用户名
        +string 邮箱
        +登录()
        +注册()
        +更新资料()
    }
    
    class 商品 {
        +int 商品ID
        +string 名称
        +decimal 价格
        +int 库存
        +更新库存()
        +获取详情()
    }
    
    class 订单 {
        +int 订单ID
        +datetime 创建时间
        +decimal 总金额
        +string 状态
        +创建订单()
        +取消订单()
    }
    
    class 购物车 {
        +int 购物车ID
        +添加商品()
        +移除商品()
        +清空()
        +计算总价()
    }
    
    用户 "1" --> "0..*" 订单 : 拥有
    用户 "1" --> "1" 购物车 : 拥有
    订单 "1" --> "1..*" 商品 : 包含
    购物车 "1" --> "0..*" 商品 : 包含`,
        'zh-TW': `classDiagram
    class 使用者 {
        +int 使用者ID
        +string 使用者名稱
        +string 郵箱
        +登入()
        +註冊()
        +更新資料()
    }
    
    class 商品 {
        +int 商品ID
        +string 名稱
        +decimal 價格
        +int 庫存
        +更新庫存()
        +獲取詳情()
    }
    
    class 訂單 {
        +int 訂單ID
        +datetime 建立時間
        +decimal 總金額
        +string 狀態
        +建立訂單()
        +取消訂單()
    }
    
    class 購物車 {
        +int 購物車ID
        +新增商品()
        +移除商品()
        +清空()
        +計算總價()
    }
    
    使用者 "1" --> "0..*" 訂單 : 擁有
    使用者 "1" --> "1" 購物車 : 擁有
    訂單 "1" --> "1..*" 商品 : 包含
    購物車 "1" --> "0..*" 商品 : 包含`,
        'ja': `classDiagram
    class ユーザー {
        +int ユーザーID
        +string ユーザー名
        +string メール
        +ログイン()
        +登録()
        +プロフィール更新()
    }
    
    class 商品 {
        +int 商品ID
        +string 名前
        +decimal 価格
        +int 在庫
        +在庫更新()
        +詳細取得()
    }
    
    class 注文 {
        +int 注文ID
        +datetime 作成日時
        +decimal 合計金額
        +string ステータス
        +注文作成()
        +注文キャンセル()
    }
    
    class カート {
        +int カートID
        +商品追加()
        +商品削除()
        +クリア()
        +合計計算()
    }
    
    ユーザー "1" --> "0..*" 注文 : 所有
    ユーザー "1" --> "1" カート : 所有
    注文 "1" --> "1..*" 商品 : 含む
    カート "1" --> "0..*" 商品 : 含む`,
        'es': `classDiagram
    class Usuario {
        +int usuarioId
        +string nombreUsuario
        +string email
        +iniciarSesion()
        +registrar()
        +actualizarPerfil()
    }
    
    class Producto {
        +int productoId
        +string nombre
        +decimal precio
        +int stock
        +actualizarStock()
        +obtenerDetalles()
    }
    
    class Pedido {
        +int pedidoId
        +datetime fechaCreacion
        +decimal total
        +string estado
        +crearPedido()
        +cancelarPedido()
    }
    
    class Carrito {
        +int carritoId
        +agregarProducto()
        +eliminarProducto()
        +vaciar()
        +calcularTotal()
    }
    
    Usuario "1" --> "0..*" Pedido : realiza
    Usuario "1" --> "1" Carrito : posee
    Pedido "1" --> "1..*" Producto : contiene
    Carrito "1" --> "0..*" Producto : contiene`,
        'pt': `classDiagram
    class Usuario {
        +int usuarioId
        +string nomeUsuario
        +string email
        +fazerLogin()
        +registrar()
        +atualizarPerfil()
    }
    
    class Produto {
        +int produtoId
        +string nome
        +decimal preco
        +int estoque
        +atualizarEstoque()
        +obterDetalhes()
    }
    
    class Pedido {
        +int pedidoId
        +datetime dataCriacao
        +decimal total
        +string status
        +criarPedido()
        +cancelarPedido()
    }
    
    class Carrinho {
        +int carrinhoId
        +adicionarProduto()
        +removerProduto()
        +limpar()
        +calcularTotal()
    }
    
    Usuario "1" --> "0..*" Pedido : faz
    Usuario "1" --> "1" Carrinho : possui
    Pedido "1" --> "1..*" Produto : contém
    Carrinho "1" --> "0..*" Produto : contém`,
      },
    },
  ],
  state: [
    {
      id: 'state-order',
      name: {
        'en': 'Order State Machine',
        'zh-CN': '订单状态机',
        'zh-TW': '訂單狀態機',
        'ja': '注文ステートマシン',
        'es': 'Máquina de estados de pedido',
        'pt': 'Máquina de estados de pedido',
      },
      code: {
        'en': `stateDiagram-v2
    [*] --> Created: Create Order
    Created --> Paid: Payment Success
    Created --> Cancelled: Cancel Order
    Paid --> Processing: Start Processing
    Processing --> Shipped: Ship Items
    Shipped --> Delivered: Confirm Delivery
    Delivered --> [*]
    Cancelled --> [*]
    
    Processing --> Cancelled: Cancel Request
    Shipped --> Returned: Return Request
    Returned --> [*]`,
        'zh-CN': `stateDiagram-v2
    [*] --> 已创建: 创建订单
    已创建 --> 已支付: 支付成功
    已创建 --> 已取消: 取消订单
    已支付 --> 处理中: 开始处理
    处理中 --> 已发货: 发货
    已发货 --> 已送达: 确认送达
    已送达 --> [*]
    已取消 --> [*]
    
    处理中 --> 已取消: 取消请求
    已发货 --> 已退货: 退货请求
    已退货 --> [*]`,
        'zh-TW': `stateDiagram-v2
    [*] --> 已建立: 建立訂單
    已建立 --> 已支付: 支付成功
    已建立 --> 已取消: 取消訂單
    已支付 --> 處理中: 開始處理
    處理中 --> 已發貨: 發貨
    已發貨 --> 已送達: 確認送達
    已送達 --> [*]
    已取消 --> [*]
    
    處理中 --> 已取消: 取消請求
    已發貨 --> 已退貨: 退貨請求
    已退貨 --> [*]`,
        'ja': `stateDiagram-v2
    [*] --> 作成済み: 注文作成
    作成済み --> 支払済み: 支払い成功
    作成済み --> キャンセル: 注文キャンセル
    支払済み --> 処理中: 処理開始
    処理中 --> 発送済み: 発送
    発送済み --> 配達完了: 配達確認
    配達完了 --> [*]
    キャンセル --> [*]
    
    処理中 --> キャンセル: キャンセルリクエスト
    発送済み --> 返品済み: 返品リクエスト
    返品済み --> [*]`,
        'es': `stateDiagram-v2
    [*] --> Creado: Crear Pedido
    Creado --> Pagado: Pago Exitoso
    Creado --> Cancelado: Cancelar Pedido
    Pagado --> Procesando: Iniciar Procesamiento
    Procesando --> Enviado: Enviar Artículos
    Enviado --> Entregado: Confirmar Entrega
    Entregado --> [*]
    Cancelado --> [*]
    
    Procesando --> Cancelado: Solicitud de Cancelación
    Enviado --> Devuelto: Solicitud de Devolución
    Devuelto --> [*]`,
        'pt': `stateDiagram-v2
    [*] --> Criado: Criar Pedido
    Criado --> Pago: Pagamento Bem-sucedido
    Criado --> Cancelado: Cancelar Pedido
    Pago --> Processando: Iniciar Processamento
    Processando --> Enviado: Enviar Itens
    Enviado --> Entregue: Confirmar Entrega
    Entregue --> [*]
    Cancelado --> [*]
    
    Processando --> Cancelado: Solicitação de Cancelamento
    Enviado --> Devolvido: Solicitação de Devolução
    Devolvido --> [*]`,
      },
    },
  ],
  er: [
    {
      id: 'er-blog',
      name: {
        'en': 'Blog Database Schema',
        'zh-CN': '博客数据库架构',
        'zh-TW': '部落格資料庫架構',
        'ja': 'ブログデータベーススキーマ',
        'es': 'Esquema de base de datos de blog',
        'pt': 'Esquema de banco de dados de blog',
      },
      code: {
        'en': `erDiagram
    USER ||--o{ POST : writes
    USER ||--o{ COMMENT : makes
    POST ||--o{ COMMENT : has
    POST }o--|| CATEGORY : belongs_to
    POST }o--o{ TAG : has
    
    USER {
        int user_id PK
        string username
        string email
        datetime created_at
    }
    
    POST {
        int post_id PK
        int user_id FK
        int category_id FK
        string title
        text content
        datetime published_at
    }
    
    COMMENT {
        int comment_id PK
        int user_id FK
        int post_id FK
        text content
        datetime created_at
    }
    
    CATEGORY {
        int category_id PK
        string name
    }
    
    TAG {
        int tag_id PK
        string name
    }`,
        'zh-CN': `erDiagram
    用户 ||--o{ 文章 : 撰写
    用户 ||--o{ 评论 : 发表
    文章 ||--o{ 评论 : 包含
    文章 }o--|| 分类 : 属于
    文章 }o--o{ 标签 : 拥有
    
    用户 {
        int 用户ID PK
        string 用户名
        string 邮箱
        datetime 创建时间
    }
    
    文章 {
        int 文章ID PK
        int 用户ID FK
        int 分类ID FK
        string 标题
        text 内容
        datetime 发布时间
    }
    
    评论 {
        int 评论ID PK
        int 用户ID FK
        int 文章ID FK
        text 内容
        datetime 创建时间
    }
    
    分类 {
        int 分类ID PK
        string 名称
    }
    
    标签 {
        int 标签ID PK
        string 名称
    }`,
        'zh-TW': `erDiagram
    使用者 ||--o{ 文章 : 撰寫
    使用者 ||--o{ 評論 : 發表
    文章 ||--o{ 評論 : 包含
    文章 }o--|| 分類 : 屬於
    文章 }o--o{ 標籤 : 擁有
    
    使用者 {
        int 使用者ID PK
        string 使用者名稱
        string 郵箱
        datetime 建立時間
    }
    
    文章 {
        int 文章ID PK
        int 使用者ID FK
        int 分類ID FK
        string 標題
        text 內容
        datetime 發布時間
    }
    
    評論 {
        int 評論ID PK
        int 使用者ID FK
        int 文章ID FK
        text 內容
        datetime 建立時間
    }
    
    分類 {
        int 分類ID PK
        string 名稱
    }
    
    標籤 {
        int 標籤ID PK
        string 名稱
    }`,
        'ja': `erDiagram
    ユーザー ||--o{ 投稿 : 書く
    ユーザー ||--o{ コメント : する
    投稿 ||--o{ コメント : 持つ
    投稿 }o--|| カテゴリ : 属する
    投稿 }o--o{ タグ : 持つ
    
    ユーザー {
        int ユーザーID PK
        string ユーザー名
        string メール
        datetime 作成日時
    }
    
    投稿 {
        int 投稿ID PK
        int ユーザーID FK
        int カテゴリID FK
        string タイトル
        text 内容
        datetime 公開日時
    }
    
    コメント {
        int コメントID PK
        int ユーザーID FK
        int 投稿ID FK
        text 内容
        datetime 作成日時
    }
    
    カテゴリ {
        int カテゴリID PK
        string 名前
    }
    
    タグ {
        int タグID PK
        string 名前
    }`,
        'es': `erDiagram
    USUARIO ||--o{ PUBLICACION : escribe
    USUARIO ||--o{ COMENTARIO : hace
    PUBLICACION ||--o{ COMENTARIO : tiene
    PUBLICACION }o--|| CATEGORIA : pertenece_a
    PUBLICACION }o--o{ ETIQUETA : tiene
    
    USUARIO {
        int user_id PK
        string nombreUsuario
        string email
        datetime fecha_creacion
    }
    
    PUBLICACION {
        int post_id PK
        int user_id FK
        int category_id FK
        string titulo
        text contenido
        datetime fecha_publicacion
    }
    
    COMENTARIO {
        int comment_id PK
        int user_id FK
        int post_id FK
        text contenido
        datetime fecha_creacion
    }
    
    CATEGORIA {
        int category_id PK
        string nombre
    }
    
    ETIQUETA {
        int tag_id PK
        string nombre
    }`,
        'pt': `erDiagram
    USUARIO ||--o{ PUBLICACAO : escreve
    USUARIO ||--o{ COMENTARIO : faz
    PUBLICACAO ||--o{ COMENTARIO : tem
    PUBLICACAO }o--|| CATEGORIA : pertence_a
    PUBLICACAO }o--o{ TAG : tem
    
    USUARIO {
        int user_id PK
        string nomeUsuario
        string email
        datetime data_criacao
    }
    
    PUBLICACAO {
        int post_id PK
        int user_id FK
        int category_id FK
        string titulo
        text conteudo
        datetime data_publicacao
    }
    
    COMENTARIO {
        int comment_id PK
        int user_id FK
        int post_id FK
        text conteudo
        datetime data_criacao
    }
    
    CATEGORIA {
        int category_id PK
        string nome
    }
    
    TAG {
        int tag_id PK
        string nome
    }`,
      },
    },
  ],
  gantt: [
    {
      id: 'gantt-project',
      name: {
        'en': 'Project Timeline',
        'zh-CN': '项目时间线',
        'zh-TW': '專案時間線',
        'ja': 'プロジェクトタイムライン',
        'es': 'Cronograma del proyecto',
        'pt': 'Linha do tempo do projeto',
      },
      code: {
        'en': `gantt
    title Project Development Timeline
    dateFormat YYYY-MM-DD
    section Planning
    Requirements Analysis    :a1, 2024-01-01, 10d
    Design Mockups          :a2, after a1, 15d
    section Development
    Backend API             :a3, 2024-01-26, 20d
    Frontend UI             :a4, after a3, 15d
    Integration             :a5, after a4, 10d
    section Testing
    Unit Testing            :a6, after a5, 7d
    Integration Testing     :a7, after a6, 5d
    section Deployment
    Production Deployment   :a8, after a7, 3d`,
        'zh-CN': `gantt
    title 项目开发时间线
    dateFormat YYYY-MM-DD
    section 规划阶段
    需求分析            :a1, 2024-01-01, 10d
    设计原型            :a2, after a1, 15d
    section 开发阶段
    后端API开发         :a3, 2024-01-26, 20d
    前端UI开发          :a4, after a3, 15d
    系统集成            :a5, after a4, 10d
    section 测试阶段
    单元测试            :a6, after a5, 7d
    集成测试            :a7, after a6, 5d
    section 部署阶段
    生产环境部署        :a8, after a7, 3d`,
        'zh-TW': `gantt
    title 專案開發時間線
    dateFormat YYYY-MM-DD
    section 規劃階段
    需求分析            :a1, 2024-01-01, 10d
    設計原型            :a2, after a1, 15d
    section 開發階段
    後端API開發         :a3, 2024-01-26, 20d
    前端UI開發          :a4, after a3, 15d
    系統整合            :a5, after a4, 10d
    section 測試階段
    單元測試            :a6, after a5, 7d
    整合測試            :a7, after a6, 5d
    section 部署階段
    生產環境部署        :a8, after a7, 3d`,
        'ja': `gantt
    title プロジェクト開発タイムライン
    dateFormat YYYY-MM-DD
    section 計画段階
    要件分析            :a1, 2024-01-01, 10d
    設計モックアップ    :a2, after a1, 15d
    section 開発段階
    バックエンドAPI     :a3, 2024-01-26, 20d
    フロントエンドUI    :a4, after a3, 15d
    統合                :a5, after a4, 10d
    section テスト段階
    ユニットテスト      :a6, after a5, 7d
    統合テスト          :a7, after a6, 5d
    section デプロイ段階
    本番環境デプロイ    :a8, after a7, 3d`,
        'es': `gantt
    title Cronograma de Desarrollo del Proyecto
    dateFormat YYYY-MM-DD
    section Planificación
    Análisis de Requisitos :a1, 2024-01-01, 10d
    Diseño de Mockups      :a2, after a1, 15d
    section Desarrollo
    API Backend            :a3, 2024-01-26, 20d
    UI Frontend            :a4, after a3, 15d
    Integración            :a5, after a4, 10d
    section Pruebas
    Pruebas Unitarias      :a6, after a5, 7d
    Pruebas de Integración :a7, after a6, 5d
    section Despliegue
    Despliegue a Producción :a8, after a7, 3d`,
        'pt': `gantt
    title Cronograma de Desenvolvimento do Projeto
    dateFormat YYYY-MM-DD
    section Planejamento
    Análise de Requisitos :a1, 2024-01-01, 10d
    Design de Mockups     :a2, after a1, 15d
    section Desenvolvimento
    API Backend           :a3, 2024-01-26, 20d
    UI Frontend           :a4, after a3, 15d
    Integração            :a5, after a4, 10d
    section Testes
    Testes Unitários      :a6, after a5, 7d
    Testes de Integração  :a7, after a6, 5d
    section Implantação
    Implantação em Produção :a8, after a7, 3d`,
      },
    },
  ],
  pie: [
    {
      id: 'pie-market',
      name: {
        'en': 'Market Share',
        'zh-CN': '市场份额',
        'zh-TW': '市場份額',
        'ja': '市場シェア',
        'es': 'Cuota de mercado',
        'pt': 'Participação de mercado',
      },
      code: {
        'en': `pie title Market Share Distribution
    "Company A" : 35
    "Company B" : 25
    "Company C" : 20
    "Company D" : 12
    "Others" : 8`,
        'zh-CN': `pie title 市场份额分布
    "公司A" : 35
    "公司B" : 25
    "公司C" : 20
    "公司D" : 12
    "其他" : 8`,
        'zh-TW': `pie title 市場份額分佈
    "公司A" : 35
    "公司B" : 25
    "公司C" : 20
    "公司D" : 12
    "其他" : 8`,
        'ja': `pie title 市場シェア分布
    "企業A" : 35
    "企業B" : 25
    "企業C" : 20
    "企業D" : 12
    "その他" : 8`,
        'es': `pie title Distribución de Cuota de Mercado
    "Empresa A" : 35
    "Empresa B" : 25
    "Empresa C" : 20
    "Empresa D" : 12
    "Otros" : 8`,
        'pt': `pie title Distribuição de Participação de Mercado
    "Empresa A" : 35
    "Empresa B" : 25
    "Empresa C" : 20
    "Empresa D" : 12
    "Outros" : 8`,
      },
    },
  ],
  git: [
    {
      id: 'git-workflow',
      name: {
        'en': 'Git Workflow',
        'zh-CN': 'Git 工作流',
        'zh-TW': 'Git 工作流程',
        'ja': 'Gitワークフロー',
        'es': 'Flujo de trabajo Git',
        'pt': 'Fluxo de trabalho Git',
      },
      code: {
        'en': `gitGraph
    commit id: "Initial commit"
    branch develop
    checkout develop
    commit id: "Add feature A"
    commit id: "Add feature B"
    checkout main
    merge develop
    commit id: "Release v1.0"
    branch hotfix
    commit id: "Fix critical bug"
    checkout main
    merge hotfix
    commit id: "Release v1.0.1"`,
        'zh-CN': `gitGraph
    commit id: "初始提交"
    branch develop
    checkout develop
    commit id: "添加功能A"
    commit id: "添加功能B"
    checkout main
    merge develop
    commit id: "发布v1.0"
    branch hotfix
    commit id: "修复关键bug"
    checkout main
    merge hotfix
    commit id: "发布v1.0.1"`,
        'zh-TW': `gitGraph
    commit id: "初始提交"
    branch develop
    checkout develop
    commit id: "新增功能A"
    commit id: "新增功能B"
    checkout main
    merge develop
    commit id: "發布v1.0"
    branch hotfix
    commit id: "修復關鍵bug"
    checkout main
    merge hotfix
    commit id: "發布v1.0.1"`,
        'ja': `gitGraph
    commit id: "初期コミット"
    branch develop
    checkout develop
    commit id: "機能A追加"
    commit id: "機能B追加"
    checkout main
    merge develop
    commit id: "リリースv1.0"
    branch hotfix
    commit id: "重大なバグ修正"
    checkout main
    merge hotfix
    commit id: "リリースv1.0.1"`,
        'es': `gitGraph
    commit id: "Commit inicial"
    branch develop
    checkout develop
    commit id: "Añadir función A"
    commit id: "Añadir función B"
    checkout main
    merge develop
    commit id: "Lanzamiento v1.0"
    branch hotfix
    commit id: "Corregir error crítico"
    checkout main
    merge hotfix
    commit id: "Lanzamiento v1.0.1"`,
        'pt': `gitGraph
    commit id: "Commit inicial"
    branch develop
    checkout develop
    commit id: "Adicionar função A"
    commit id: "Adicionar função B"
    checkout main
    merge develop
    commit id: "Lançamento v1.0"
    branch hotfix
    commit id: "Corrigir bug crítico"
    checkout main
    merge hotfix
    commit id: "Lançamento v1.0.1"`,
      },
    },
  ],
  chart: [
    {
      id: 'chart-line',
      name: {
        'en': 'Line Chart - Sales Trend',
        'zh-CN': '折线图 - 销售趋势',
        'zh-TW': '折線圖 - 銷售趨勢',
        'ja': '折れ線グラフ - 売上トレンド',
        'es': 'Gráfico de Líneas - Tendencia de Ventas',
        'pt': 'Gráfico de Linhas - Tendência de Vendas',
      },
      code: {
        'en': `xychart-beta
    title "Monthly Sales Trend"
    x-axis [jan, feb, mar, apr, may, jun, jul, aug, sep, oct, nov, dec]
    y-axis "Revenue ($K)" 0 --> 120
    line [30, 45, 55, 48, 70, 85, 78, 92, 88, 95, 105, 120]`,
        'zh-CN': `xychart-beta
    title "月度销售趋势"
    x-axis ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"]
    y-axis "销售额 (千美元)" 0 --> 120
    line [30, 45, 55, 48, 70, 85, 78, 92, 88, 95, 105, 120]`,
        'zh-TW': `xychart-beta
    title "月度銷售趨勢"
    x-axis ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"]
    y-axis "銷售額 (千美元)" 0 --> 120
    line [30, 45, 55, 48, 70, 85, 78, 92, 88, 95, 105, 120]`,
        'ja': `xychart-beta
    title "月次売上トレンド"
    x-axis ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"]
    y-axis "売上 (千米ドル)" 0 --> 120
    line [30, 45, 55, 48, 70, 85, 78, 92, 88, 95, 105, 120]`,
        'es': `xychart-beta
    title "Tendencia de Ventas Mensuales"
    x-axis [ene, feb, mar, abr, may, jun, jul, ago, sep, oct, nov, dic]
    y-axis "Ventas ($K)" 0 --> 120
    line [30, 45, 55, 48, 70, 85, 78, 92, 88, 95, 105, 120]`,
        'pt': `xychart-beta
    title "Tendência de Vendas Mensais"
    x-axis [jan, fev, mar, abr, mai, jun, jul, ago, set, out, nov, dez]
    y-axis "Vendas ($K)" 0 --> 120
    line [30, 45, 55, 48, 70, 85, 78, 92, 88, 95, 105, 120]`,
      },
    },
    {
      id: 'chart-bar',
      name: {
        'en': 'Bar Chart - Quarterly Revenue',
        'zh-CN': '柱状图 - 季度收入',
        'zh-TW': '柱狀圖 - 季度收入',
        'ja': '棒グラフ - 四半期収益',
        'es': 'Gráfico de Barras - Ingresos Trimestrales',
        'pt': 'Gráfico de Barras - Receita Trimestral',
      },
      code: {
        'en': `xychart-beta
    title "Quarterly Revenue Comparison"
    x-axis [Q1, Q2, Q3, Q4]
    y-axis "Revenue ($M)" 0 --> 150
    bar [65, 95, 120, 140]`,
        'zh-CN': `xychart-beta
    title "季度收入对比"
    x-axis ["第一季度", "第二季度", "第三季度", "第四季度"]
    y-axis "收入 (百万美元)" 0 --> 150
    bar [65, 95, 120, 140]`,
        'zh-TW': `xychart-beta
    title "季度收入對比"
    x-axis ["第一季度", "第二季度", "第三季度", "第四季度"]
    y-axis "收入 (百萬美元)" 0 --> 150
    bar [65, 95, 120, 140]`,
        'ja': `xychart-beta
    title "四半期収益比較"
    x-axis [Q1, Q2, Q3, Q4]
    y-axis "収益 (百万米ドル)" 0 --> 150
    bar [65, 95, 120, 140]`,
        'es': `xychart-beta
    title "Comparación de Ingresos Trimestrales"
    x-axis [T1, T2, T3, T4]
    y-axis "Ingresos ($M)" 0 --> 150
    bar [65, 95, 120, 140]`,
        'pt': `xychart-beta
    title "Comparação de Receita Trimestral"
    x-axis [T1, T2, T3, T4]
    y-axis "Receita ($M)" 0 --> 150
    bar [65, 95, 120, 140]`,
      },
    },
    {
      id: 'chart-multi',
      name: {
        'en': 'Multi-Series Chart - Product Comparison',
        'zh-CN': '多系列图表 - 产品对比',
        'zh-TW': '多系列圖表 - 產品對比',
        'ja': '複数系列グラフ - 製品比較',
        'es': 'Gráfico Multi-Series - Comparación de Productos',
        'pt': 'Gráfico Multi-Séries - Comparação de Produtos',
      },
      code: {
        'en': `xychart-beta
    title "Product Sales Comparison"
    x-axis [jan, feb, mar, apr, may, jun]
    y-axis "Sales Units" 0 --> 200
    line "Product A" [50, 80, 120, 100, 150, 170]
    line "Product B" [30, 60, 90, 110, 130, 145]
    bar "Product C" [40, 70, 85, 95, 105, 115]`,
        'zh-CN': `xychart-beta
    title "产品销量对比"
    x-axis ["1月", "2月", "3月", "4月", "5月", "6月"]
    y-axis "销量" 0 --> 200
    line "产品A" [50, 80, 120, 100, 150, 170]
    line "产品B" [30, 60, 90, 110, 130, 145]
    bar "产品C" [40, 70, 85, 95, 105, 115]`,
        'zh-TW': `xychart-beta
    title "產品銷量對比"
    x-axis ["1月", "2月", "3月", "4月", "5月", "6月"]
    y-axis "銷量" 0 --> 200
    line "產品A" [50, 80, 120, 100, 150, 170]
    line "產品B" [30, 60, 90, 110, 130, 145]
    bar "產品C" [40, 70, 85, 95, 105, 115]`,
        'ja': `xychart-beta
    title "製品売上比較"
    x-axis ["1月", "2月", "3月", "4月", "5月", "6月"]
    y-axis "販売数" 0 --> 200
    line "製品A" [50, 80, 120, 100, 150, 170]
    line "製品B" [30, 60, 90, 110, 130, 145]
    bar "製品C" [40, 70, 85, 95, 105, 115]`,
        'es': `xychart-beta
    title "Comparación de Ventas de Productos"
    x-axis [ene, feb, mar, abr, may, jun]
    y-axis "Unidades Vendidas" 0 --> 200
    line "Producto A" [50, 80, 120, 100, 150, 170]
    line "Producto B" [30, 60, 90, 110, 130, 145]
    bar "Producto C" [40, 70, 85, 95, 105, 115]`,
        'pt': `xychart-beta
    title "Comparação de Vendas de Produtos"
    x-axis [jan, fev, mar, abr, mai, jun]
    y-axis "Unidades Vendidas" 0 --> 200
    line "Produto A" [50, 80, 120, 100, 150, 170]
    line "Produto B" [30, 60, 90, 110, 130, 145]
    bar "Produto C" [40, 70, 85, 95, 105, 115]`,
      },
    },
  ],
  journey: [
    {
      id: 'journey-onboarding',
      name: {
        'en': 'Developer Onboarding',
        'zh-CN': 'Developer Onboarding',
        'zh-TW': 'Developer Onboarding',
        'ja': 'Developer Onboarding',
        'es': 'Developer Onboarding',
        'pt': 'Developer Onboarding',
      },
      code: {
        'en': `journey
    title Developer Onboarding
    section Day One
      Receive laptop: 3: New Hire
      Set up environment: 2: New Hire, Buddy
      Read architecture docs: 4: New Hire
    section First Week
      Fix a starter bug: 5: New Hire, Buddy
      Open first pull request: 5: New Hire
      Ship to production: 4: New Hire, Team`,
        'zh-CN': `journey
    title Developer Onboarding
    section Day One
      Receive laptop: 3: New Hire
      Set up environment: 2: New Hire, Buddy
      Read architecture docs: 4: New Hire
    section First Week
      Fix a starter bug: 5: New Hire, Buddy
      Open first pull request: 5: New Hire
      Ship to production: 4: New Hire, Team`,
        'zh-TW': `journey
    title Developer Onboarding
    section Day One
      Receive laptop: 3: New Hire
      Set up environment: 2: New Hire, Buddy
      Read architecture docs: 4: New Hire
    section First Week
      Fix a starter bug: 5: New Hire, Buddy
      Open first pull request: 5: New Hire
      Ship to production: 4: New Hire, Team`,
        'ja': `journey
    title Developer Onboarding
    section Day One
      Receive laptop: 3: New Hire
      Set up environment: 2: New Hire, Buddy
      Read architecture docs: 4: New Hire
    section First Week
      Fix a starter bug: 5: New Hire, Buddy
      Open first pull request: 5: New Hire
      Ship to production: 4: New Hire, Team`,
        'es': `journey
    title Developer Onboarding
    section Day One
      Receive laptop: 3: New Hire
      Set up environment: 2: New Hire, Buddy
      Read architecture docs: 4: New Hire
    section First Week
      Fix a starter bug: 5: New Hire, Buddy
      Open first pull request: 5: New Hire
      Ship to production: 4: New Hire, Team`,
        'pt': `journey
    title Developer Onboarding
    section Day One
      Receive laptop: 3: New Hire
      Set up environment: 2: New Hire, Buddy
      Read architecture docs: 4: New Hire
    section First Week
      Fix a starter bug: 5: New Hire, Buddy
      Open first pull request: 5: New Hire
      Ship to production: 4: New Hire, Team`,
      },
    },
  ],
  mindmap: [
    {
      id: 'mindmap-release',
      name: {
        'en': 'Release Plan',
        'zh-CN': 'Release Plan',
        'zh-TW': 'Release Plan',
        'ja': 'Release Plan',
        'es': 'Release Plan',
        'pt': 'Release Plan',
      },
      code: {
        'en': `mindmap
  root((Release Plan))
    Scope
      Must have
      Nice to have
    Quality
      Unit tests
      Load testing
      Security review
    Rollout
      Canary
      Progressive
      Full traffic
    Comms
      Changelog
      Status page`,
        'zh-CN': `mindmap
  root((Release Plan))
    Scope
      Must have
      Nice to have
    Quality
      Unit tests
      Load testing
      Security review
    Rollout
      Canary
      Progressive
      Full traffic
    Comms
      Changelog
      Status page`,
        'zh-TW': `mindmap
  root((Release Plan))
    Scope
      Must have
      Nice to have
    Quality
      Unit tests
      Load testing
      Security review
    Rollout
      Canary
      Progressive
      Full traffic
    Comms
      Changelog
      Status page`,
        'ja': `mindmap
  root((Release Plan))
    Scope
      Must have
      Nice to have
    Quality
      Unit tests
      Load testing
      Security review
    Rollout
      Canary
      Progressive
      Full traffic
    Comms
      Changelog
      Status page`,
        'es': `mindmap
  root((Release Plan))
    Scope
      Must have
      Nice to have
    Quality
      Unit tests
      Load testing
      Security review
    Rollout
      Canary
      Progressive
      Full traffic
    Comms
      Changelog
      Status page`,
        'pt': `mindmap
  root((Release Plan))
    Scope
      Must have
      Nice to have
    Quality
      Unit tests
      Load testing
      Security review
    Rollout
      Canary
      Progressive
      Full traffic
    Comms
      Changelog
      Status page`,
      },
    },
  ],
  timeline: [
    {
      id: 'timeline-product',
      name: {
        'en': 'Product History',
        'zh-CN': 'Product History',
        'zh-TW': 'Product History',
        'ja': 'Product History',
        'es': 'Product History',
        'pt': 'Product History',
      },
      code: {
        'en': `timeline
    title Product History
    section Foundation
      2021 : Prototype in a notebook
           : First internal demo
      2022 : Public beta
    section Growth
      2023 : Self-hosted release
           : Plugin API
      2024 : Theme engine
    section Maturity
      2025 : Enterprise SSO`,
        'zh-CN': `timeline
    title Product History
    section Foundation
      2021 : Prototype in a notebook
           : First internal demo
      2022 : Public beta
    section Growth
      2023 : Self-hosted release
           : Plugin API
      2024 : Theme engine
    section Maturity
      2025 : Enterprise SSO`,
        'zh-TW': `timeline
    title Product History
    section Foundation
      2021 : Prototype in a notebook
           : First internal demo
      2022 : Public beta
    section Growth
      2023 : Self-hosted release
           : Plugin API
      2024 : Theme engine
    section Maturity
      2025 : Enterprise SSO`,
        'ja': `timeline
    title Product History
    section Foundation
      2021 : Prototype in a notebook
           : First internal demo
      2022 : Public beta
    section Growth
      2023 : Self-hosted release
           : Plugin API
      2024 : Theme engine
    section Maturity
      2025 : Enterprise SSO`,
        'es': `timeline
    title Product History
    section Foundation
      2021 : Prototype in a notebook
           : First internal demo
      2022 : Public beta
    section Growth
      2023 : Self-hosted release
           : Plugin API
      2024 : Theme engine
    section Maturity
      2025 : Enterprise SSO`,
        'pt': `timeline
    title Product History
    section Foundation
      2021 : Prototype in a notebook
           : First internal demo
      2022 : Public beta
    section Growth
      2023 : Self-hosted release
           : Plugin API
      2024 : Theme engine
    section Maturity
      2025 : Enterprise SSO`,
      },
    },
  ],
  quadrant: [
    {
      id: 'quadrant-priority',
      name: {
        'en': 'Feature Prioritization',
        'zh-CN': 'Feature Prioritization',
        'zh-TW': 'Feature Prioritization',
        'ja': 'Feature Prioritization',
        'es': 'Feature Prioritization',
        'pt': 'Feature Prioritization',
      },
      code: {
        'en': `quadrantChart
    title Feature Prioritization
    x-axis Low Effort --> High Effort
    y-axis Low Impact --> High Impact
    quadrant-1 Do now
    quadrant-2 Plan carefully
    quadrant-3 Skip
    quadrant-4 Quick wins
    SVG export: [0.35, 0.82]
    Theme backup: [0.25, 0.65]
    Clipboard copy: [0.15, 0.55]
    Full rewrite: [0.92, 0.45]
    Legacy migration: [0.78, 0.28]`,
        'zh-CN': `quadrantChart
    title Feature Prioritization
    x-axis Low Effort --> High Effort
    y-axis Low Impact --> High Impact
    quadrant-1 Do now
    quadrant-2 Plan carefully
    quadrant-3 Skip
    quadrant-4 Quick wins
    SVG export: [0.35, 0.82]
    Theme backup: [0.25, 0.65]
    Clipboard copy: [0.15, 0.55]
    Full rewrite: [0.92, 0.45]
    Legacy migration: [0.78, 0.28]`,
        'zh-TW': `quadrantChart
    title Feature Prioritization
    x-axis Low Effort --> High Effort
    y-axis Low Impact --> High Impact
    quadrant-1 Do now
    quadrant-2 Plan carefully
    quadrant-3 Skip
    quadrant-4 Quick wins
    SVG export: [0.35, 0.82]
    Theme backup: [0.25, 0.65]
    Clipboard copy: [0.15, 0.55]
    Full rewrite: [0.92, 0.45]
    Legacy migration: [0.78, 0.28]`,
        'ja': `quadrantChart
    title Feature Prioritization
    x-axis Low Effort --> High Effort
    y-axis Low Impact --> High Impact
    quadrant-1 Do now
    quadrant-2 Plan carefully
    quadrant-3 Skip
    quadrant-4 Quick wins
    SVG export: [0.35, 0.82]
    Theme backup: [0.25, 0.65]
    Clipboard copy: [0.15, 0.55]
    Full rewrite: [0.92, 0.45]
    Legacy migration: [0.78, 0.28]`,
        'es': `quadrantChart
    title Feature Prioritization
    x-axis Low Effort --> High Effort
    y-axis Low Impact --> High Impact
    quadrant-1 Do now
    quadrant-2 Plan carefully
    quadrant-3 Skip
    quadrant-4 Quick wins
    SVG export: [0.35, 0.82]
    Theme backup: [0.25, 0.65]
    Clipboard copy: [0.15, 0.55]
    Full rewrite: [0.92, 0.45]
    Legacy migration: [0.78, 0.28]`,
        'pt': `quadrantChart
    title Feature Prioritization
    x-axis Low Effort --> High Effort
    y-axis Low Impact --> High Impact
    quadrant-1 Do now
    quadrant-2 Plan carefully
    quadrant-3 Skip
    quadrant-4 Quick wins
    SVG export: [0.35, 0.82]
    Theme backup: [0.25, 0.65]
    Clipboard copy: [0.15, 0.55]
    Full rewrite: [0.92, 0.45]
    Legacy migration: [0.78, 0.28]`,
      },
    },
  ],
  requirement: [
    {
      id: 'requirement-offline',
      name: {
        'en': 'Offline Access Requirement',
        'zh-CN': 'Offline Access Requirement',
        'zh-TW': 'Offline Access Requirement',
        'ja': 'Offline Access Requirement',
        'es': 'Offline Access Requirement',
        'pt': 'Offline Access Requirement',
      },
      code: {
        'en': `requirementDiagram
    requirement offline_access {
        id: 1
        text: The editor must render diagrams without a network connection.
        risk: high
        verifymethod: test
    }

    functionalRequirement service_worker {
        id: 1.1
        text: A service worker caches the application shell.
        risk: medium
        verifymethod: test
    }

    element pwa_bundle {
        type: build artifact
    }

    offline_access - contains -> service_worker
    pwa_bundle - satisfies -> service_worker`,
        'zh-CN': `requirementDiagram
    requirement offline_access {
        id: 1
        text: The editor must render diagrams without a network connection.
        risk: high
        verifymethod: test
    }

    functionalRequirement service_worker {
        id: 1.1
        text: A service worker caches the application shell.
        risk: medium
        verifymethod: test
    }

    element pwa_bundle {
        type: build artifact
    }

    offline_access - contains -> service_worker
    pwa_bundle - satisfies -> service_worker`,
        'zh-TW': `requirementDiagram
    requirement offline_access {
        id: 1
        text: The editor must render diagrams without a network connection.
        risk: high
        verifymethod: test
    }

    functionalRequirement service_worker {
        id: 1.1
        text: A service worker caches the application shell.
        risk: medium
        verifymethod: test
    }

    element pwa_bundle {
        type: build artifact
    }

    offline_access - contains -> service_worker
    pwa_bundle - satisfies -> service_worker`,
        'ja': `requirementDiagram
    requirement offline_access {
        id: 1
        text: The editor must render diagrams without a network connection.
        risk: high
        verifymethod: test
    }

    functionalRequirement service_worker {
        id: 1.1
        text: A service worker caches the application shell.
        risk: medium
        verifymethod: test
    }

    element pwa_bundle {
        type: build artifact
    }

    offline_access - contains -> service_worker
    pwa_bundle - satisfies -> service_worker`,
        'es': `requirementDiagram
    requirement offline_access {
        id: 1
        text: The editor must render diagrams without a network connection.
        risk: high
        verifymethod: test
    }

    functionalRequirement service_worker {
        id: 1.1
        text: A service worker caches the application shell.
        risk: medium
        verifymethod: test
    }

    element pwa_bundle {
        type: build artifact
    }

    offline_access - contains -> service_worker
    pwa_bundle - satisfies -> service_worker`,
        'pt': `requirementDiagram
    requirement offline_access {
        id: 1
        text: The editor must render diagrams without a network connection.
        risk: high
        verifymethod: test
    }

    functionalRequirement service_worker {
        id: 1.1
        text: A service worker caches the application shell.
        risk: medium
        verifymethod: test
    }

    element pwa_bundle {
        type: build artifact
    }

    offline_access - contains -> service_worker
    pwa_bundle - satisfies -> service_worker`,
      },
    },
  ],
  c4: [
    {
      id: 'c4-context',
      name: {
        'en': 'System Context',
        'zh-CN': 'System Context',
        'zh-TW': 'System Context',
        'ja': 'System Context',
        'es': 'System Context',
        'pt': 'System Context',
      },
      code: {
        'en': `C4Context
    title System Context: Self-Hosted Diagram Editor

    Person(author, "Technical Writer", "Writes documentation")
    System(editor, "Diagram Editor", "Renders and themes diagrams in the browser")
    System_Ext(docs, "Docs Repository", "Stores Markdown with embedded diagrams")
    System_Ext(ci, "CI Pipeline", "Builds and publishes the container image")

    Rel(author, editor, "Authors and themes diagrams")
    Rel(author, docs, "Commits Markdown")
    Rel(ci, editor, "Publishes image")
    Rel(docs, editor, "Diagram source pasted into")`,
        'zh-CN': `C4Context
    title System Context: Self-Hosted Diagram Editor

    Person(author, "Technical Writer", "Writes documentation")
    System(editor, "Diagram Editor", "Renders and themes diagrams in the browser")
    System_Ext(docs, "Docs Repository", "Stores Markdown with embedded diagrams")
    System_Ext(ci, "CI Pipeline", "Builds and publishes the container image")

    Rel(author, editor, "Authors and themes diagrams")
    Rel(author, docs, "Commits Markdown")
    Rel(ci, editor, "Publishes image")
    Rel(docs, editor, "Diagram source pasted into")`,
        'zh-TW': `C4Context
    title System Context: Self-Hosted Diagram Editor

    Person(author, "Technical Writer", "Writes documentation")
    System(editor, "Diagram Editor", "Renders and themes diagrams in the browser")
    System_Ext(docs, "Docs Repository", "Stores Markdown with embedded diagrams")
    System_Ext(ci, "CI Pipeline", "Builds and publishes the container image")

    Rel(author, editor, "Authors and themes diagrams")
    Rel(author, docs, "Commits Markdown")
    Rel(ci, editor, "Publishes image")
    Rel(docs, editor, "Diagram source pasted into")`,
        'ja': `C4Context
    title System Context: Self-Hosted Diagram Editor

    Person(author, "Technical Writer", "Writes documentation")
    System(editor, "Diagram Editor", "Renders and themes diagrams in the browser")
    System_Ext(docs, "Docs Repository", "Stores Markdown with embedded diagrams")
    System_Ext(ci, "CI Pipeline", "Builds and publishes the container image")

    Rel(author, editor, "Authors and themes diagrams")
    Rel(author, docs, "Commits Markdown")
    Rel(ci, editor, "Publishes image")
    Rel(docs, editor, "Diagram source pasted into")`,
        'es': `C4Context
    title System Context: Self-Hosted Diagram Editor

    Person(author, "Technical Writer", "Writes documentation")
    System(editor, "Diagram Editor", "Renders and themes diagrams in the browser")
    System_Ext(docs, "Docs Repository", "Stores Markdown with embedded diagrams")
    System_Ext(ci, "CI Pipeline", "Builds and publishes the container image")

    Rel(author, editor, "Authors and themes diagrams")
    Rel(author, docs, "Commits Markdown")
    Rel(ci, editor, "Publishes image")
    Rel(docs, editor, "Diagram source pasted into")`,
        'pt': `C4Context
    title System Context: Self-Hosted Diagram Editor

    Person(author, "Technical Writer", "Writes documentation")
    System(editor, "Diagram Editor", "Renders and themes diagrams in the browser")
    System_Ext(docs, "Docs Repository", "Stores Markdown with embedded diagrams")
    System_Ext(ci, "CI Pipeline", "Builds and publishes the container image")

    Rel(author, editor, "Authors and themes diagrams")
    Rel(author, docs, "Commits Markdown")
    Rel(ci, editor, "Publishes image")
    Rel(docs, editor, "Diagram source pasted into")`,
      },
    },
  ],
  sankey: [
    {
      id: 'sankey-storage',
      name: {
        'en': 'Storage Flow',
        'zh-CN': 'Storage Flow',
        'zh-TW': 'Storage Flow',
        'ja': 'Storage Flow',
        'es': 'Storage Flow',
        'pt': 'Storage Flow',
      },
      code: {
        'en': `sankey-beta

Bulk Storage,Photos,1200
Bulk Storage,Music,400
Bulk Storage,Household,900
Photos,Cloud Backup,1200
Music,Cloud Backup,400
Household,Cloud Backup,900
Cloud Backup,Offsite Replica,2500`,
        'zh-CN': `sankey-beta

Bulk Storage,Photos,1200
Bulk Storage,Music,400
Bulk Storage,Household,900
Photos,Cloud Backup,1200
Music,Cloud Backup,400
Household,Cloud Backup,900
Cloud Backup,Offsite Replica,2500`,
        'zh-TW': `sankey-beta

Bulk Storage,Photos,1200
Bulk Storage,Music,400
Bulk Storage,Household,900
Photos,Cloud Backup,1200
Music,Cloud Backup,400
Household,Cloud Backup,900
Cloud Backup,Offsite Replica,2500`,
        'ja': `sankey-beta

Bulk Storage,Photos,1200
Bulk Storage,Music,400
Bulk Storage,Household,900
Photos,Cloud Backup,1200
Music,Cloud Backup,400
Household,Cloud Backup,900
Cloud Backup,Offsite Replica,2500`,
        'es': `sankey-beta

Bulk Storage,Photos,1200
Bulk Storage,Music,400
Bulk Storage,Household,900
Photos,Cloud Backup,1200
Music,Cloud Backup,400
Household,Cloud Backup,900
Cloud Backup,Offsite Replica,2500`,
        'pt': `sankey-beta

Bulk Storage,Photos,1200
Bulk Storage,Music,400
Bulk Storage,Household,900
Photos,Cloud Backup,1200
Music,Cloud Backup,400
Household,Cloud Backup,900
Cloud Backup,Offsite Replica,2500`,
      },
    },
  ],
  block: [
    {
      id: 'block-architecture',
      name: {
        'en': 'Application Blocks',
        'zh-CN': 'Application Blocks',
        'zh-TW': 'Application Blocks',
        'ja': 'Application Blocks',
        'es': 'Application Blocks',
        'pt': 'Application Blocks',
      },
      code: {
        'en': `block-beta
  columns 3
  Browser["Browser"]:3
  space:3
  block:services:3
    Editor["Editor"]
    Renderer["Mermaid Renderer"]
    Exporter["Export Engine"]
  end
  space:3
  Storage["localStorage"]:3
  Browser --> Editor
  Editor --> Renderer
  Renderer --> Exporter
  Editor --> Storage`,
        'zh-CN': `block-beta
  columns 3
  Browser["Browser"]:3
  space:3
  block:services:3
    Editor["Editor"]
    Renderer["Mermaid Renderer"]
    Exporter["Export Engine"]
  end
  space:3
  Storage["localStorage"]:3
  Browser --> Editor
  Editor --> Renderer
  Renderer --> Exporter
  Editor --> Storage`,
        'zh-TW': `block-beta
  columns 3
  Browser["Browser"]:3
  space:3
  block:services:3
    Editor["Editor"]
    Renderer["Mermaid Renderer"]
    Exporter["Export Engine"]
  end
  space:3
  Storage["localStorage"]:3
  Browser --> Editor
  Editor --> Renderer
  Renderer --> Exporter
  Editor --> Storage`,
        'ja': `block-beta
  columns 3
  Browser["Browser"]:3
  space:3
  block:services:3
    Editor["Editor"]
    Renderer["Mermaid Renderer"]
    Exporter["Export Engine"]
  end
  space:3
  Storage["localStorage"]:3
  Browser --> Editor
  Editor --> Renderer
  Renderer --> Exporter
  Editor --> Storage`,
        'es': `block-beta
  columns 3
  Browser["Browser"]:3
  space:3
  block:services:3
    Editor["Editor"]
    Renderer["Mermaid Renderer"]
    Exporter["Export Engine"]
  end
  space:3
  Storage["localStorage"]:3
  Browser --> Editor
  Editor --> Renderer
  Renderer --> Exporter
  Editor --> Storage`,
        'pt': `block-beta
  columns 3
  Browser["Browser"]:3
  space:3
  block:services:3
    Editor["Editor"]
    Renderer["Mermaid Renderer"]
    Exporter["Export Engine"]
  end
  space:3
  Storage["localStorage"]:3
  Browser --> Editor
  Editor --> Renderer
  Renderer --> Exporter
  Editor --> Storage`,
      },
    },
  ],
  architecture: [
    {
      id: 'architecture-selfhost',
      name: {
        'en': 'Self-Hosted Deployment',
        'zh-CN': 'Self-Hosted Deployment',
        'zh-TW': 'Self-Hosted Deployment',
        'ja': 'Self-Hosted Deployment',
        'es': 'Self-Hosted Deployment',
        'pt': 'Self-Hosted Deployment',
      },
      code: {
        'en': `architecture-beta
    group frontend(cloud)[Browser]
    group backend(cloud)[Self Hosted]

    service editor(server)[Editor] in frontend
    service cache(disk)[Local Storage] in frontend
    service nginx(server)[Nginx] in backend
    service assets(disk)[Static Assets] in backend

    editor:R -- L:cache
    editor:B -- T:nginx
    nginx:R -- L:assets`,
        'zh-CN': `architecture-beta
    group frontend(cloud)[Browser]
    group backend(cloud)[Self Hosted]

    service editor(server)[Editor] in frontend
    service cache(disk)[Local Storage] in frontend
    service nginx(server)[Nginx] in backend
    service assets(disk)[Static Assets] in backend

    editor:R -- L:cache
    editor:B -- T:nginx
    nginx:R -- L:assets`,
        'zh-TW': `architecture-beta
    group frontend(cloud)[Browser]
    group backend(cloud)[Self Hosted]

    service editor(server)[Editor] in frontend
    service cache(disk)[Local Storage] in frontend
    service nginx(server)[Nginx] in backend
    service assets(disk)[Static Assets] in backend

    editor:R -- L:cache
    editor:B -- T:nginx
    nginx:R -- L:assets`,
        'ja': `architecture-beta
    group frontend(cloud)[Browser]
    group backend(cloud)[Self Hosted]

    service editor(server)[Editor] in frontend
    service cache(disk)[Local Storage] in frontend
    service nginx(server)[Nginx] in backend
    service assets(disk)[Static Assets] in backend

    editor:R -- L:cache
    editor:B -- T:nginx
    nginx:R -- L:assets`,
        'es': `architecture-beta
    group frontend(cloud)[Browser]
    group backend(cloud)[Self Hosted]

    service editor(server)[Editor] in frontend
    service cache(disk)[Local Storage] in frontend
    service nginx(server)[Nginx] in backend
    service assets(disk)[Static Assets] in backend

    editor:R -- L:cache
    editor:B -- T:nginx
    nginx:R -- L:assets`,
        'pt': `architecture-beta
    group frontend(cloud)[Browser]
    group backend(cloud)[Self Hosted]

    service editor(server)[Editor] in frontend
    service cache(disk)[Local Storage] in frontend
    service nginx(server)[Nginx] in backend
    service assets(disk)[Static Assets] in backend

    editor:R -- L:cache
    editor:B -- T:nginx
    nginx:R -- L:assets`,
      },
    },
  ],
  kanban: [
    {
      id: 'kanban-roadmap',
      name: {
        'en': 'Roadmap Board',
        'zh-CN': 'Roadmap Board',
        'zh-TW': 'Roadmap Board',
        'ja': 'Roadmap Board',
        'es': 'Roadmap Board',
        'pt': 'Roadmap Board',
      },
      code: {
        'en': `kanban
  Backlog
    [Add SVG export]
    [Theme library backup]
  In Progress
    [Diagram example coverage]@{ assigned: 'jcz' }
  Review
    [Resolve Dependabot alerts]
  Done
    [Remove analytics]
    [Modernize dependencies]`,
        'zh-CN': `kanban
  Backlog
    [Add SVG export]
    [Theme library backup]
  In Progress
    [Diagram example coverage]@{ assigned: 'jcz' }
  Review
    [Resolve Dependabot alerts]
  Done
    [Remove analytics]
    [Modernize dependencies]`,
        'zh-TW': `kanban
  Backlog
    [Add SVG export]
    [Theme library backup]
  In Progress
    [Diagram example coverage]@{ assigned: 'jcz' }
  Review
    [Resolve Dependabot alerts]
  Done
    [Remove analytics]
    [Modernize dependencies]`,
        'ja': `kanban
  Backlog
    [Add SVG export]
    [Theme library backup]
  In Progress
    [Diagram example coverage]@{ assigned: 'jcz' }
  Review
    [Resolve Dependabot alerts]
  Done
    [Remove analytics]
    [Modernize dependencies]`,
        'es': `kanban
  Backlog
    [Add SVG export]
    [Theme library backup]
  In Progress
    [Diagram example coverage]@{ assigned: 'jcz' }
  Review
    [Resolve Dependabot alerts]
  Done
    [Remove analytics]
    [Modernize dependencies]`,
        'pt': `kanban
  Backlog
    [Add SVG export]
    [Theme library backup]
  In Progress
    [Diagram example coverage]@{ assigned: 'jcz' }
  Review
    [Resolve Dependabot alerts]
  Done
    [Remove analytics]
    [Modernize dependencies]`,
      },
    },
  ],
  packet: [
    {
      id: 'packet-tcp',
      name: {
        'en': 'TCP Header',
        'zh-CN': 'TCP Header',
        'zh-TW': 'TCP Header',
        'ja': 'TCP Header',
        'es': 'TCP Header',
        'pt': 'TCP Header',
      },
      code: {
        'en': `packet-beta
title TCP Header
0-15: "Source Port"
16-31: "Destination Port"
32-63: "Sequence Number"
64-95: "Acknowledgment Number"
96-99: "Data Offset"
100-105: "Reserved"
106-111: "Flags"
112-127: "Window Size"
128-143: "Checksum"
144-159: "Urgent Pointer"`,
        'zh-CN': `packet-beta
title TCP Header
0-15: "Source Port"
16-31: "Destination Port"
32-63: "Sequence Number"
64-95: "Acknowledgment Number"
96-99: "Data Offset"
100-105: "Reserved"
106-111: "Flags"
112-127: "Window Size"
128-143: "Checksum"
144-159: "Urgent Pointer"`,
        'zh-TW': `packet-beta
title TCP Header
0-15: "Source Port"
16-31: "Destination Port"
32-63: "Sequence Number"
64-95: "Acknowledgment Number"
96-99: "Data Offset"
100-105: "Reserved"
106-111: "Flags"
112-127: "Window Size"
128-143: "Checksum"
144-159: "Urgent Pointer"`,
        'ja': `packet-beta
title TCP Header
0-15: "Source Port"
16-31: "Destination Port"
32-63: "Sequence Number"
64-95: "Acknowledgment Number"
96-99: "Data Offset"
100-105: "Reserved"
106-111: "Flags"
112-127: "Window Size"
128-143: "Checksum"
144-159: "Urgent Pointer"`,
        'es': `packet-beta
title TCP Header
0-15: "Source Port"
16-31: "Destination Port"
32-63: "Sequence Number"
64-95: "Acknowledgment Number"
96-99: "Data Offset"
100-105: "Reserved"
106-111: "Flags"
112-127: "Window Size"
128-143: "Checksum"
144-159: "Urgent Pointer"`,
        'pt': `packet-beta
title TCP Header
0-15: "Source Port"
16-31: "Destination Port"
32-63: "Sequence Number"
64-95: "Acknowledgment Number"
96-99: "Data Offset"
100-105: "Reserved"
106-111: "Flags"
112-127: "Window Size"
128-143: "Checksum"
144-159: "Urgent Pointer"`,
      },
    },
  ],
  radar: [
    {
      id: 'radar-storage',
      name: {
        'en': 'Storage Backend Comparison',
        'zh-CN': 'Storage Backend Comparison',
        'zh-TW': 'Storage Backend Comparison',
        'ja': 'Storage Backend Comparison',
        'es': 'Storage Backend Comparison',
        'pt': 'Storage Backend Comparison',
      },
      code: {
        'en': `radar-beta
  title Storage Backend Comparison
  axis cost["Cost"], speed["Speed"], flex["Flexibility"]
  axis recover["Recoverability"], simple["Simplicity"]

  curve zfs["ZFS"]{3, 5, 2, 5, 2}
  curve mergerfs["mergerfs + SnapRAID"]{5, 3, 5, 4, 4}

  max 5
  min 0`,
        'zh-CN': `radar-beta
  title Storage Backend Comparison
  axis cost["Cost"], speed["Speed"], flex["Flexibility"]
  axis recover["Recoverability"], simple["Simplicity"]

  curve zfs["ZFS"]{3, 5, 2, 5, 2}
  curve mergerfs["mergerfs + SnapRAID"]{5, 3, 5, 4, 4}

  max 5
  min 0`,
        'zh-TW': `radar-beta
  title Storage Backend Comparison
  axis cost["Cost"], speed["Speed"], flex["Flexibility"]
  axis recover["Recoverability"], simple["Simplicity"]

  curve zfs["ZFS"]{3, 5, 2, 5, 2}
  curve mergerfs["mergerfs + SnapRAID"]{5, 3, 5, 4, 4}

  max 5
  min 0`,
        'ja': `radar-beta
  title Storage Backend Comparison
  axis cost["Cost"], speed["Speed"], flex["Flexibility"]
  axis recover["Recoverability"], simple["Simplicity"]

  curve zfs["ZFS"]{3, 5, 2, 5, 2}
  curve mergerfs["mergerfs + SnapRAID"]{5, 3, 5, 4, 4}

  max 5
  min 0`,
        'es': `radar-beta
  title Storage Backend Comparison
  axis cost["Cost"], speed["Speed"], flex["Flexibility"]
  axis recover["Recoverability"], simple["Simplicity"]

  curve zfs["ZFS"]{3, 5, 2, 5, 2}
  curve mergerfs["mergerfs + SnapRAID"]{5, 3, 5, 4, 4}

  max 5
  min 0`,
        'pt': `radar-beta
  title Storage Backend Comparison
  axis cost["Cost"], speed["Speed"], flex["Flexibility"]
  axis recover["Recoverability"], simple["Simplicity"]

  curve zfs["ZFS"]{3, 5, 2, 5, 2}
  curve mergerfs["mergerfs + SnapRAID"]{5, 3, 5, 4, 4}

  max 5
  min 0`,
      },
    },
  ],
  treemap: [
    {
      id: 'treemap-storage',
      name: {
        'en': 'Storage Pool Usage',
        'zh-CN': 'Storage Pool Usage',
        'zh-TW': 'Storage Pool Usage',
        'ja': 'Storage Pool Usage',
        'es': 'Storage Pool Usage',
        'pt': 'Storage Pool Usage',
      },
      code: {
        'en': `treemap-beta
"Storage Pool"
    "Photos"
        "2024": 420
        "2025": 380
    "Music"
        "Lossless": 260
        "Compressed": 140
    "Household"
        "Documents": 90
        "Video": 610`,
        'zh-CN': `treemap-beta
"Storage Pool"
    "Photos"
        "2024": 420
        "2025": 380
    "Music"
        "Lossless": 260
        "Compressed": 140
    "Household"
        "Documents": 90
        "Video": 610`,
        'zh-TW': `treemap-beta
"Storage Pool"
    "Photos"
        "2024": 420
        "2025": 380
    "Music"
        "Lossless": 260
        "Compressed": 140
    "Household"
        "Documents": 90
        "Video": 610`,
        'ja': `treemap-beta
"Storage Pool"
    "Photos"
        "2024": 420
        "2025": 380
    "Music"
        "Lossless": 260
        "Compressed": 140
    "Household"
        "Documents": 90
        "Video": 610`,
        'es': `treemap-beta
"Storage Pool"
    "Photos"
        "2024": 420
        "2025": 380
    "Music"
        "Lossless": 260
        "Compressed": 140
    "Household"
        "Documents": 90
        "Video": 610`,
        'pt': `treemap-beta
"Storage Pool"
    "Photos"
        "2024": 420
        "2025": 380
    "Music"
        "Lossless": 260
        "Compressed": 140
    "Household"
        "Documents": 90
        "Video": 610`,
      },
    },
  ],
  venn: [
    {
      id: 'venn-tools',
      name: {
        'en': 'Diagram Tool Capabilities',
        'zh-CN': 'Diagram Tool Capabilities',
        'zh-TW': 'Diagram Tool Capabilities',
        'ja': 'Diagram Tool Capabilities',
        'es': 'Diagram Tool Capabilities',
        'pt': 'Diagram Tool Capabilities',
      },
      code: {
        'en': `venn-beta
    title Diagram Tool Capabilities
    set Mermaid: 30
    set Graphviz: 22
    set Excalidraw: 18
    set MermaidGraphviz: 9
    set MermaidExcalidraw: 6
    set GraphvizExcalidraw: 4
    set MermaidGraphvizExcalidraw: 2`,
        'zh-CN': `venn-beta
    title Diagram Tool Capabilities
    set Mermaid: 30
    set Graphviz: 22
    set Excalidraw: 18
    set MermaidGraphviz: 9
    set MermaidExcalidraw: 6
    set GraphvizExcalidraw: 4
    set MermaidGraphvizExcalidraw: 2`,
        'zh-TW': `venn-beta
    title Diagram Tool Capabilities
    set Mermaid: 30
    set Graphviz: 22
    set Excalidraw: 18
    set MermaidGraphviz: 9
    set MermaidExcalidraw: 6
    set GraphvizExcalidraw: 4
    set MermaidGraphvizExcalidraw: 2`,
        'ja': `venn-beta
    title Diagram Tool Capabilities
    set Mermaid: 30
    set Graphviz: 22
    set Excalidraw: 18
    set MermaidGraphviz: 9
    set MermaidExcalidraw: 6
    set GraphvizExcalidraw: 4
    set MermaidGraphvizExcalidraw: 2`,
        'es': `venn-beta
    title Diagram Tool Capabilities
    set Mermaid: 30
    set Graphviz: 22
    set Excalidraw: 18
    set MermaidGraphviz: 9
    set MermaidExcalidraw: 6
    set GraphvizExcalidraw: 4
    set MermaidGraphvizExcalidraw: 2`,
        'pt': `venn-beta
    title Diagram Tool Capabilities
    set Mermaid: 30
    set Graphviz: 22
    set Excalidraw: 18
    set MermaidGraphviz: 9
    set MermaidExcalidraw: 6
    set GraphvizExcalidraw: 4
    set MermaidGraphvizExcalidraw: 2`,
      },
    },
  ],
  swimlane: [
    {
      id: 'swimlane-pipeline',
      name: {
        'en': 'Render Pipeline',
        'zh-CN': 'Render Pipeline',
        'zh-TW': 'Render Pipeline',
        'ja': 'Render Pipeline',
        'es': 'Render Pipeline',
        'pt': 'Render Pipeline',
      },
      code: {
        'en': `swimlane-beta
    Author --> Editor
    Editor --> Renderer
    Renderer --> Preview
    Preview --> Export`,
        'zh-CN': `swimlane-beta
    Author --> Editor
    Editor --> Renderer
    Renderer --> Preview
    Preview --> Export`,
        'zh-TW': `swimlane-beta
    Author --> Editor
    Editor --> Renderer
    Renderer --> Preview
    Preview --> Export`,
        'ja': `swimlane-beta
    Author --> Editor
    Editor --> Renderer
    Renderer --> Preview
    Preview --> Export`,
        'es': `swimlane-beta
    Author --> Editor
    Editor --> Renderer
    Renderer --> Preview
    Preview --> Export`,
        'pt': `swimlane-beta
    Author --> Editor
    Editor --> Renderer
    Renderer --> Preview
    Preview --> Export`,
      },
    },
  ],
  wardley: [
    {
      id: 'wardley-editing',
      name: {
        'en': 'Diagram Editing Value Chain',
        'zh-CN': 'Diagram Editing Value Chain',
        'zh-TW': 'Diagram Editing Value Chain',
        'ja': 'Diagram Editing Value Chain',
        'es': 'Diagram Editing Value Chain',
        'pt': 'Diagram Editing Value Chain',
      },
      code: {
        'en': `wardley-beta
  title Diagram Editing Value Chain
  anchor Writer [0.95, 0.62]
  component Diagram [0.80, 0.55]
  component Renderer [0.62, 0.72]
  component Browser [0.40, 0.92]
  Writer -> Diagram
  Diagram -> Renderer
  Renderer -> Browser`,
        'zh-CN': `wardley-beta
  title Diagram Editing Value Chain
  anchor Writer [0.95, 0.62]
  component Diagram [0.80, 0.55]
  component Renderer [0.62, 0.72]
  component Browser [0.40, 0.92]
  Writer -> Diagram
  Diagram -> Renderer
  Renderer -> Browser`,
        'zh-TW': `wardley-beta
  title Diagram Editing Value Chain
  anchor Writer [0.95, 0.62]
  component Diagram [0.80, 0.55]
  component Renderer [0.62, 0.72]
  component Browser [0.40, 0.92]
  Writer -> Diagram
  Diagram -> Renderer
  Renderer -> Browser`,
        'ja': `wardley-beta
  title Diagram Editing Value Chain
  anchor Writer [0.95, 0.62]
  component Diagram [0.80, 0.55]
  component Renderer [0.62, 0.72]
  component Browser [0.40, 0.92]
  Writer -> Diagram
  Diagram -> Renderer
  Renderer -> Browser`,
        'es': `wardley-beta
  title Diagram Editing Value Chain
  anchor Writer [0.95, 0.62]
  component Diagram [0.80, 0.55]
  component Renderer [0.62, 0.72]
  component Browser [0.40, 0.92]
  Writer -> Diagram
  Diagram -> Renderer
  Renderer -> Browser`,
        'pt': `wardley-beta
  title Diagram Editing Value Chain
  anchor Writer [0.95, 0.62]
  component Diagram [0.80, 0.55]
  component Renderer [0.62, 0.72]
  component Browser [0.40, 0.92]
  Writer -> Diagram
  Diagram -> Renderer
  Renderer -> Browser`,
      },
    },
  ],
  cynefin: [
    {
      id: 'cynefin-incident',
      name: {
        'en': 'Incident Response Domains',
        'zh-CN': 'Incident Response Domains',
        'zh-TW': 'Incident Response Domains',
        'ja': 'Incident Response Domains',
        'es': 'Incident Response Domains',
        'pt': 'Incident Response Domains',
      },
      code: {
        'en': `cynefin-beta
  title Incident Response Domains
  clear "Restart the stuck service"
  complicated "Tune the slow query planner"
  complex "Intermittent data corruption"
  chaotic "Total production outage"`,
        'zh-CN': `cynefin-beta
  title Incident Response Domains
  clear "Restart the stuck service"
  complicated "Tune the slow query planner"
  complex "Intermittent data corruption"
  chaotic "Total production outage"`,
        'zh-TW': `cynefin-beta
  title Incident Response Domains
  clear "Restart the stuck service"
  complicated "Tune the slow query planner"
  complex "Intermittent data corruption"
  chaotic "Total production outage"`,
        'ja': `cynefin-beta
  title Incident Response Domains
  clear "Restart the stuck service"
  complicated "Tune the slow query planner"
  complex "Intermittent data corruption"
  chaotic "Total production outage"`,
        'es': `cynefin-beta
  title Incident Response Domains
  clear "Restart the stuck service"
  complicated "Tune the slow query planner"
  complex "Intermittent data corruption"
  chaotic "Total production outage"`,
        'pt': `cynefin-beta
  title Incident Response Domains
  clear "Restart the stuck service"
  complicated "Tune the slow query planner"
  complex "Intermittent data corruption"
  chaotic "Total production outage"`,
      },
    },
  ],
  ishikawa: [
    {
      id: 'ishikawa-build',
      name: {
        'en': 'Why Did the Build Break?',
        'zh-CN': 'Why Did the Build Break?',
        'zh-TW': 'Why Did the Build Break?',
        'ja': 'Why Did the Build Break?',
        'es': 'Why Did the Build Break?',
        'pt': 'Why Did the Build Break?',
      },
      code: {
        'en': `ishikawa-beta
  title Why did the build break?
  cause People
    sub Review skipped
    sub Onboarding gap
  cause Process
    sub No lockfile check
    sub Missing CI gate
  cause Tooling
    sub Stale dependency cache`,
        'zh-CN': `ishikawa-beta
  title Why did the build break?
  cause People
    sub Review skipped
    sub Onboarding gap
  cause Process
    sub No lockfile check
    sub Missing CI gate
  cause Tooling
    sub Stale dependency cache`,
        'zh-TW': `ishikawa-beta
  title Why did the build break?
  cause People
    sub Review skipped
    sub Onboarding gap
  cause Process
    sub No lockfile check
    sub Missing CI gate
  cause Tooling
    sub Stale dependency cache`,
        'ja': `ishikawa-beta
  title Why did the build break?
  cause People
    sub Review skipped
    sub Onboarding gap
  cause Process
    sub No lockfile check
    sub Missing CI gate
  cause Tooling
    sub Stale dependency cache`,
        'es': `ishikawa-beta
  title Why did the build break?
  cause People
    sub Review skipped
    sub Onboarding gap
  cause Process
    sub No lockfile check
    sub Missing CI gate
  cause Tooling
    sub Stale dependency cache`,
        'pt': `ishikawa-beta
  title Why did the build break?
  cause People
    sub Review skipped
    sub Onboarding gap
  cause Process
    sub No lockfile check
    sub Missing CI gate
  cause Tooling
    sub Stale dependency cache`,
      },
    },
  ],
  info: [
    {
      id: 'info-version',
      name: {
        'en': 'Mermaid Version Info',
        'zh-CN': 'Mermaid Version Info',
        'zh-TW': 'Mermaid Version Info',
        'ja': 'Mermaid Version Info',
        'es': 'Mermaid Version Info',
        'pt': 'Mermaid Version Info',
      },
      code: {
        'en': `info`,
        'zh-CN': `info`,
        'zh-TW': `info`,
        'ja': `info`,
        'es': `info`,
        'pt': `info`,
      },
    },
  ],
  railroadEbnf: [
    {
      id: 'railroad-ebnf-grammar',
      name: {
        'en': 'Diagram Grammar (EBNF)',
        'zh-CN': 'Diagram Grammar (EBNF)',
        'zh-TW': 'Diagram Grammar (EBNF)',
        'ja': 'Diagram Grammar (EBNF)',
        'es': 'Diagram Grammar (EBNF)',
        'pt': 'Diagram Grammar (EBNF)',
      },
      code: {
        'en': `railroad-ebnf-beta
  diagram = header, body;
  header = "flowchart", direction;
  direction = "TD" | "LR" | "BT" | "RL";
  body = { statement };
  statement = node, [ link, node ];`,
        'zh-CN': `railroad-ebnf-beta
  diagram = header, body;
  header = "flowchart", direction;
  direction = "TD" | "LR" | "BT" | "RL";
  body = { statement };
  statement = node, [ link, node ];`,
        'zh-TW': `railroad-ebnf-beta
  diagram = header, body;
  header = "flowchart", direction;
  direction = "TD" | "LR" | "BT" | "RL";
  body = { statement };
  statement = node, [ link, node ];`,
        'ja': `railroad-ebnf-beta
  diagram = header, body;
  header = "flowchart", direction;
  direction = "TD" | "LR" | "BT" | "RL";
  body = { statement };
  statement = node, [ link, node ];`,
        'es': `railroad-ebnf-beta
  diagram = header, body;
  header = "flowchart", direction;
  direction = "TD" | "LR" | "BT" | "RL";
  body = { statement };
  statement = node, [ link, node ];`,
        'pt': `railroad-ebnf-beta
  diagram = header, body;
  header = "flowchart", direction;
  direction = "TD" | "LR" | "BT" | "RL";
  body = { statement };
  statement = node, [ link, node ];`,
      },
    },
  ],
  railroadAbnf: [
    {
      id: 'railroad-abnf-greeting',
      name: {
        'en': 'Greeting Rule (ABNF)',
        'zh-CN': 'Greeting Rule (ABNF)',
        'zh-TW': 'Greeting Rule (ABNF)',
        'ja': 'Greeting Rule (ABNF)',
        'es': 'Greeting Rule (ABNF)',
        'pt': 'Greeting Rule (ABNF)',
      },
      code: {
        'en': `railroad-abnf-beta
  greeting = salutation SP target;
  salutation = "hello" / "hi";
  target = 1*ALPHA;
  SP = %x20;`,
        'zh-CN': `railroad-abnf-beta
  greeting = salutation SP target;
  salutation = "hello" / "hi";
  target = 1*ALPHA;
  SP = %x20;`,
        'zh-TW': `railroad-abnf-beta
  greeting = salutation SP target;
  salutation = "hello" / "hi";
  target = 1*ALPHA;
  SP = %x20;`,
        'ja': `railroad-abnf-beta
  greeting = salutation SP target;
  salutation = "hello" / "hi";
  target = 1*ALPHA;
  SP = %x20;`,
        'es': `railroad-abnf-beta
  greeting = salutation SP target;
  salutation = "hello" / "hi";
  target = 1*ALPHA;
  SP = %x20;`,
        'pt': `railroad-abnf-beta
  greeting = salutation SP target;
  salutation = "hello" / "hi";
  target = 1*ALPHA;
  SP = %x20;`,
      },
    },
  ],
  railroadPeg: [
    {
      id: 'railroad-peg-expr',
      name: {
        'en': 'Arithmetic Expression (PEG)',
        'zh-CN': 'Arithmetic Expression (PEG)',
        'zh-TW': 'Arithmetic Expression (PEG)',
        'ja': 'Arithmetic Expression (PEG)',
        'es': 'Arithmetic Expression (PEG)',
        'pt': 'Arithmetic Expression (PEG)',
      },
      code: {
        'en': `railroad-peg-beta
  expression <- term (("+" / "-") term)*;
  term <- factor (("*" / "/") factor)*;
  factor <- number / "(" expression ")";
  number <- digit+;
  digit <- "0" / "1" / "2" / "3" / "4";`,
        'zh-CN': `railroad-peg-beta
  expression <- term (("+" / "-") term)*;
  term <- factor (("*" / "/") factor)*;
  factor <- number / "(" expression ")";
  number <- digit+;
  digit <- "0" / "1" / "2" / "3" / "4";`,
        'zh-TW': `railroad-peg-beta
  expression <- term (("+" / "-") term)*;
  term <- factor (("*" / "/") factor)*;
  factor <- number / "(" expression ")";
  number <- digit+;
  digit <- "0" / "1" / "2" / "3" / "4";`,
        'ja': `railroad-peg-beta
  expression <- term (("+" / "-") term)*;
  term <- factor (("*" / "/") factor)*;
  factor <- number / "(" expression ")";
  number <- digit+;
  digit <- "0" / "1" / "2" / "3" / "4";`,
        'es': `railroad-peg-beta
  expression <- term (("+" / "-") term)*;
  term <- factor (("*" / "/") factor)*;
  factor <- number / "(" expression ")";
  number <- digit+;
  digit <- "0" / "1" / "2" / "3" / "4";`,
        'pt': `railroad-peg-beta
  expression <- term (("+" / "-") term)*;
  term <- factor (("*" / "/") factor)*;
  factor <- number / "(" expression ")";
  number <- digit+;
  digit <- "0" / "1" / "2" / "3" / "4";`,
      },
    },
  ],
};

export const getCategoryName = (category: ExampleCategory, lang: Language): string => {
  const names: Record<ExampleCategory, Record<Language, string>> = {
    flowchart: {
      'en': 'Flowchart',
      'zh-CN': '流程图',
      'zh-TW': '流程圖',
      'ja': 'フローチャート',
      'es': 'Diagrama de Flujo',
      'pt': 'Fluxograma',
    },
    sequence: {
      'en': 'Sequence Diagram',
      'zh-CN': '时序图',
      'zh-TW': '時序圖',
      'ja': 'シーケンス図',
      'es': 'Diagrama de Secuencia',
      'pt': 'Diagrama de Sequência',
    },
    class: {
      'en': 'Class Diagram',
      'zh-CN': '类图',
      'zh-TW': '類別圖',
      'ja': 'クラス図',
      'es': 'Diagrama de Clases',
      'pt': 'Diagrama de Classes',
    },
    state: {
      'en': 'State Diagram',
      'zh-CN': '状态图',
      'zh-TW': '狀態圖',
      'ja': 'ステート図',
      'es': 'Diagrama de Estados',
      'pt': 'Diagrama de Estados',
    },
    er: {
      'en': 'ER Diagram',
      'zh-CN': '实体关系图',
      'zh-TW': '實體關係圖',
      'ja': 'ER図',
      'es': 'Diagrama ER',
      'pt': 'Diagrama ER',
    },
    gantt: {
      'en': 'Gantt Chart',
      'zh-CN': '甘特图',
      'zh-TW': '甘特圖',
      'ja': 'ガントチャート',
      'es': 'Diagrama de Gantt',
      'pt': 'Gráfico de Gantt',
    },
    pie: {
      'en': 'Pie Chart',
      'zh-CN': '饼图',
      'zh-TW': '圓餅圖',
      'ja': '円グラフ',
      'es': 'Gráfico Circular',
      'pt': 'Gráfico de Pizza',
    },
    git: {
      'en': 'Git Graph',
      'zh-CN': 'Git 图',
      'zh-TW': 'Git 圖',
      'ja': 'Git グラフ',
      'es': 'Gráfico Git',
      'pt': 'Gráfico Git',
    },
    chart: {
      'en': 'Line & Bar Charts',
      'zh-CN': '折线图与柱状图',
      'zh-TW': '折線圖與柱狀圖',
      'ja': '折れ線・棒グラフ',
      'es': 'Gráficos de Líneas y Barras',
      'pt': 'Gráficos de Linhas e Barras',
    },
    journey: {
      'en': 'User Journey',
      'zh-CN': 'User Journey',
      'zh-TW': 'User Journey',
      'ja': 'User Journey',
      'es': 'User Journey',
      'pt': 'User Journey',
    },
    mindmap: {
      'en': 'Mind Map',
      'zh-CN': 'Mind Map',
      'zh-TW': 'Mind Map',
      'ja': 'Mind Map',
      'es': 'Mind Map',
      'pt': 'Mind Map',
    },
    timeline: {
      'en': 'Timeline',
      'zh-CN': 'Timeline',
      'zh-TW': 'Timeline',
      'ja': 'Timeline',
      'es': 'Timeline',
      'pt': 'Timeline',
    },
    quadrant: {
      'en': 'Quadrant Chart',
      'zh-CN': 'Quadrant Chart',
      'zh-TW': 'Quadrant Chart',
      'ja': 'Quadrant Chart',
      'es': 'Quadrant Chart',
      'pt': 'Quadrant Chart',
    },
    requirement: {
      'en': 'Requirement Diagram',
      'zh-CN': 'Requirement Diagram',
      'zh-TW': 'Requirement Diagram',
      'ja': 'Requirement Diagram',
      'es': 'Requirement Diagram',
      'pt': 'Requirement Diagram',
    },
    c4: {
      'en': 'C4 Context',
      'zh-CN': 'C4 Context',
      'zh-TW': 'C4 Context',
      'ja': 'C4 Context',
      'es': 'C4 Context',
      'pt': 'C4 Context',
    },
    sankey: {
      'en': 'Sankey Diagram',
      'zh-CN': 'Sankey Diagram',
      'zh-TW': 'Sankey Diagram',
      'ja': 'Sankey Diagram',
      'es': 'Sankey Diagram',
      'pt': 'Sankey Diagram',
    },
    block: {
      'en': 'Block Diagram',
      'zh-CN': 'Block Diagram',
      'zh-TW': 'Block Diagram',
      'ja': 'Block Diagram',
      'es': 'Block Diagram',
      'pt': 'Block Diagram',
    },
    architecture: {
      'en': 'Architecture Diagram',
      'zh-CN': 'Architecture Diagram',
      'zh-TW': 'Architecture Diagram',
      'ja': 'Architecture Diagram',
      'es': 'Architecture Diagram',
      'pt': 'Architecture Diagram',
    },
    kanban: {
      'en': 'Kanban Board',
      'zh-CN': 'Kanban Board',
      'zh-TW': 'Kanban Board',
      'ja': 'Kanban Board',
      'es': 'Kanban Board',
      'pt': 'Kanban Board',
    },
    packet: {
      'en': 'Packet Diagram',
      'zh-CN': 'Packet Diagram',
      'zh-TW': 'Packet Diagram',
      'ja': 'Packet Diagram',
      'es': 'Packet Diagram',
      'pt': 'Packet Diagram',
    },
    radar: {
      'en': 'Radar Chart',
      'zh-CN': 'Radar Chart',
      'zh-TW': 'Radar Chart',
      'ja': 'Radar Chart',
      'es': 'Radar Chart',
      'pt': 'Radar Chart',
    },
    treemap: {
      'en': 'Treemap',
      'zh-CN': 'Treemap',
      'zh-TW': 'Treemap',
      'ja': 'Treemap',
      'es': 'Treemap',
      'pt': 'Treemap',
    },
    venn: {
      'en': 'Venn Diagram',
      'zh-CN': 'Venn Diagram',
      'zh-TW': 'Venn Diagram',
      'ja': 'Venn Diagram',
      'es': 'Venn Diagram',
      'pt': 'Venn Diagram',
    },
    swimlane: {
      'en': 'Swimlane Diagram',
      'zh-CN': 'Swimlane Diagram',
      'zh-TW': 'Swimlane Diagram',
      'ja': 'Swimlane Diagram',
      'es': 'Swimlane Diagram',
      'pt': 'Swimlane Diagram',
    },
    wardley: {
      'en': 'Wardley Map',
      'zh-CN': 'Wardley Map',
      'zh-TW': 'Wardley Map',
      'ja': 'Wardley Map',
      'es': 'Wardley Map',
      'pt': 'Wardley Map',
    },
    cynefin: {
      'en': 'Cynefin Framework',
      'zh-CN': 'Cynefin Framework',
      'zh-TW': 'Cynefin Framework',
      'ja': 'Cynefin Framework',
      'es': 'Cynefin Framework',
      'pt': 'Cynefin Framework',
    },
    ishikawa: {
      'en': 'Ishikawa Diagram',
      'zh-CN': 'Ishikawa Diagram',
      'zh-TW': 'Ishikawa Diagram',
      'ja': 'Ishikawa Diagram',
      'es': 'Ishikawa Diagram',
      'pt': 'Ishikawa Diagram',
    },
    info: {
      'en': 'Info',
      'zh-CN': 'Info',
      'zh-TW': 'Info',
      'ja': 'Info',
      'es': 'Info',
      'pt': 'Info',
    },
    railroadEbnf: {
      'en': 'Railroad (EBNF)',
      'zh-CN': 'Railroad (EBNF)',
      'zh-TW': 'Railroad (EBNF)',
      'ja': 'Railroad (EBNF)',
      'es': 'Railroad (EBNF)',
      'pt': 'Railroad (EBNF)',
    },
    railroadAbnf: {
      'en': 'Railroad (ABNF)',
      'zh-CN': 'Railroad (ABNF)',
      'zh-TW': 'Railroad (ABNF)',
      'ja': 'Railroad (ABNF)',
      'es': 'Railroad (ABNF)',
      'pt': 'Railroad (ABNF)',
    },
    railroadPeg: {
      'en': 'Railroad (PEG)',
      'zh-CN': 'Railroad (PEG)',
      'zh-TW': 'Railroad (PEG)',
      'ja': 'Railroad (PEG)',
      'es': 'Railroad (PEG)',
      'pt': 'Railroad (PEG)',
    },
  };
  
  return names[category][lang];
};

// Find example by ID across all categories
export const findExampleById = (id: string): { category: ExampleCategory; example: Example; index: number } | null => {
  for (const [category, exampleList] of Object.entries(examples)) {
    const index = exampleList.findIndex(ex => ex.id === id);
    if (index !== -1) {
      return {
        category: category as ExampleCategory,
        example: exampleList[index],
        index
      };
    }
  }
  return null;
};

