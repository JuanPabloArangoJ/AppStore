USE [master]
GO
CREATE DATABASE [StoreDB]
GO
USE [StoreDB]
GO
/****** Objeto: Table [dbo].[Producto] Fecha de script: 24/10/2026 10:35:29 a. m. ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Producto](
	[ProductId] [int] IDENTITY(1,1) NOT NULL,
	[SKU] [nvarchar](150) NOT NULL,
	[Name] [nvarchar](150) NOT NULL,
	[Stock] [int] NOT NULL,
	[Price] [decimal](18, 2) NOT NULL,
	[Image] [nvarchar](max) NULL,
	[CreatedAt] [datetime] NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[ProductId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Objeto: Table [dbo].[Sale] Fecha de script: 24/10/2026 10:35:29 a. m. ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Sale](
	[SaleId] [int] IDENTITY(1,1) NOT NULL,
	[UserId] [int] NOT NULL,
	[TotalAmount] [decimal](18, 2) NOT NULL,
	[CreatedAt] [datetime] NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[SaleId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Objeto: Table [dbo].[SaleDetail] Fecha de script: 24/10/2026 10:35:29 a. m. ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[SaleDetail](
	[SaleDetailId] [int] IDENTITY(1,1) NOT NULL,
	[SaleId] [int] NOT NULL,
	[ProductId] [int] NOT NULL,
	[Quantity] [int] NOT NULL,
	[SubTotal] [decimal](18, 2) NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[SaleDetailId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Objeto: Table [dbo].[Usuario] Fecha de script: 24/10/2026 10:35:29 a. m. ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Usuario](
	[UserId] [int] IDENTITY(1,1) NOT NULL,
	[FullName] [nvarchar](150) NOT NULL,
	[Email] [nvarchar](150) NOT NULL,
	[UserType] [nvarchar](50) NOT NULL,
	[Passwrd] [nvarchar](50) NOT NULL,
	[ResetPassword] [bit] NOT NULL,
	[CreatedAt] [datetime] NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[UserId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
SET IDENTITY_INSERT [dbo].[Producto] ON 

INSERT [dbo].[Producto] ([ProductId], [SKU], [Name], [Stock], [Price], [Image], [CreatedAt]) VALUES (1, N'LPT-001', N'Laptop Lenovo', 9, CAST(2800000.00 AS Decimal(18, 2)), N'0b9bdffb-4232-4a52-8b9d-124cc317fc0b.jpg', CAST(N'2026-09-30T11:39:37.793' AS DateTime))
INSERT [dbo].[Producto] ([ProductId], [SKU], [Name], [Stock], [Price], [Image], [CreatedAt]) VALUES (2, N'MSE-001', N'Mouse Gamer', 15, CAST(95000.00 AS Decimal(18, 2)), N'4b29a03b-19ce-4dd2-a006-c7a565093ca9.png', CAST(N'2026-10-02T14:06:19.713' AS DateTime))
INSERT [dbo].[Producto] ([ProductId], [SKU], [Name], [Stock], [Price], [Image], [CreatedAt]) VALUES (3, N'PC-001', N'PcGamer-4070-black', 3, CAST(3200000.00 AS Decimal(18, 2)), N'8342413b-6911-4dea-aa1a-5f9501585a4d.jpg', CAST(N'2026-10-02T17:47:22.510' AS DateTime))
INSERT [dbo].[Producto] ([ProductId], [SKU], [Name], [Stock], [Price], [Image], [CreatedAt]) VALUES (4, N'MNT-001', N'Monitor ASUS', 9, CAST(300000.00 AS Decimal(18, 2)), N'8306c28e-7680-4d3c-942f-2afda8154248.jpg', CAST(N'2026-10-05T12:11:11.490' AS DateTime))
INSERT [dbo].[Producto] ([ProductId], [SKU], [Name], [Stock], [Price], [Image], [CreatedAt]) VALUES (5, N'KYB-001', N'Teclado Antrix', 7, CAST(250000.00 AS Decimal(18, 2)), N'b2263d03-ad74-4f17-b836-787aa7e81a83.jpg', CAST(N'2026-10-05T12:11:42.990' AS DateTime))
INSERT [dbo].[Producto] ([ProductId], [SKU], [Name], [Stock], [Price], [Image], [CreatedAt]) VALUES (6, N'LPT-002', N'Laptop Asus', 10, CAST(3000000.00 AS Decimal(18, 2)), N'd53e700e-f0a1-4b48-900e-696c42c48f30.jpg', CAST(N'2026-10-05T12:13:34.320' AS DateTime))
INSERT [dbo].[Producto] ([ProductId], [SKU], [Name], [Stock], [Price], [Image], [CreatedAt]) VALUES (7, N'GM-001', N'GTA VI ps5', 19, CAST(400000.00 AS Decimal(18, 2)), N'6af8c964-5fcd-47f1-b86b-29f7bd92a88f.png', CAST(N'2026-10-05T12:19:47.180' AS DateTime))
INSERT [dbo].[Producto] ([ProductId], [SKU], [Name], [Stock], [Price], [Image], [CreatedAt]) VALUES (8, N'GM-002', N'FC-27 ps5', 15, CAST(350000.00 AS Decimal(18, 2)), N'780da5b1-85c5-428b-ab66-94cb7737a7cc.png', CAST(N'2026-10-05T12:21:56.723' AS DateTime))
INSERT [dbo].[Producto] ([ProductId], [SKU], [Name], [Stock], [Price], [Image], [CreatedAt]) VALUES (9, N'PC-002', N'PC Raizen blanca', 8, CAST(5000000.00 AS Decimal(18, 2)), N'2bdb3d48-e9ab-4be6-89d5-af5df0ab33a8.png', CAST(N'2026-10-05T12:27:02.787' AS DateTime))
SET IDENTITY_INSERT [dbo].[Producto] OFF
GO
SET IDENTITY_INSERT [dbo].[Sale] ON 

INSERT [dbo].[Sale] ([SaleId], [UserId], [TotalAmount], [CreatedAt]) VALUES (1, 1, CAST(95000.00 AS Decimal(18, 2)), CAST(N'2026-10-03T14:19:43.890' AS DateTime))
INSERT [dbo].[Sale] ([SaleId], [UserId], [TotalAmount], [CreatedAt]) VALUES (2, 8, CAST(3390000.00 AS Decimal(18, 2)), CAST(N'2026-10-03T16:22:43.710' AS DateTime))
INSERT [dbo].[Sale] ([SaleId], [UserId], [TotalAmount], [CreatedAt]) VALUES (3, 9, CAST(2990000.00 AS Decimal(18, 2)), CAST(N'2026-10-03T16:25:58.750' AS DateTime))
INSERT [dbo].[Sale] ([SaleId], [UserId], [TotalAmount], [CreatedAt]) VALUES (4, 6, CAST(3900000.00 AS Decimal(18, 2)), CAST(N'2026-10-05T19:57:48.470' AS DateTime))
SET IDENTITY_INSERT [dbo].[Sale] OFF
GO
SET IDENTITY_INSERT [dbo].[SaleDetail] ON 

INSERT [dbo].[SaleDetail] ([SaleDetailId], [SaleId], [ProductId], [Quantity], [SubTotal]) VALUES (1, 1, 2, 1, CAST(95000.00 AS Decimal(18, 2)))
INSERT [dbo].[SaleDetail] ([SaleDetailId], [SaleId], [ProductId], [Quantity], [SubTotal]) VALUES (2, 2, 3, 1, CAST(3200000.00 AS Decimal(18, 2)))
INSERT [dbo].[SaleDetail] ([SaleDetailId], [SaleId], [ProductId], [Quantity], [SubTotal]) VALUES (3, 2, 2, 2, CAST(190000.00 AS Decimal(18, 2)))
INSERT [dbo].[SaleDetail] ([SaleDetailId], [SaleId], [ProductId], [Quantity], [SubTotal]) VALUES (4, 3, 1, 1, CAST(2800000.00 AS Decimal(18, 2)))
INSERT [dbo].[SaleDetail] ([SaleDetailId], [SaleId], [ProductId], [Quantity], [SubTotal]) VALUES (5, 3, 2, 2, CAST(190000.00 AS Decimal(18, 2)))
INSERT [dbo].[SaleDetail] ([SaleDetailId], [SaleId], [ProductId], [Quantity], [SubTotal]) VALUES (6, 4, 3, 1, CAST(3200000.00 AS Decimal(18, 2)))
INSERT [dbo].[SaleDetail] ([SaleDetailId], [SaleId], [ProductId], [Quantity], [SubTotal]) VALUES (7, 4, 7, 1, CAST(400000.00 AS Decimal(18, 2)))
INSERT [dbo].[SaleDetail] ([SaleDetailId], [SaleId], [ProductId], [Quantity], [SubTotal]) VALUES (8, 4, 4, 1, CAST(300000.00 AS Decimal(18, 2)))
SET IDENTITY_INSERT [dbo].[SaleDetail] OFF
GO
SET IDENTITY_INSERT [dbo].[Usuario] ON 

INSERT [dbo].[Usuario] ([UserId], [FullName], [Email], [UserType], [Passwrd], [ResetPassword], [CreatedAt]) VALUES (1, N'Juan Pérez', N'juan.perez@email.com', N'Sales-Person', N'Password123', 1, CAST(N'2026-09-18T14:38:19.200' AS DateTime))
INSERT [dbo].[Usuario] ([UserId], [FullName], [Email], [UserType], [Passwrd], [ResetPassword], [CreatedAt]) VALUES (3, N'Juan pablo Arango Jimenez', N'juanpa.arangojimenez@gmail.com', N'Admin', N'Password123', 0, CAST(N'2026-10-01T20:37:26.180' AS DateTime))
INSERT [dbo].[Usuario] ([UserId], [FullName], [Email], [UserType], [Passwrd], [ResetPassword], [CreatedAt]) VALUES (5, N'Adiela patricia Jimenez', N'patyjuanpa@hotmail.com', N'Sales-Person', N'Password123', 1, CAST(N'2026-10-01T20:46:45.370' AS DateTime))
INSERT [dbo].[Usuario] ([UserId], [FullName], [Email], [UserType], [Passwrd], [ResetPassword], [CreatedAt]) VALUES (6, N'Alejandro Torres', N'Alejo.t@correo.com', N'Sales-Person', N'Password123', 0, CAST(N'2026-10-01T20:47:09.233' AS DateTime))
INSERT [dbo].[Usuario] ([UserId], [FullName], [Email], [UserType], [Passwrd], [ResetPassword], [CreatedAt]) VALUES (7, N'Juan pablo Jimenez', N'juanarango1121@correo.com', N'Admin', N'Password123', 0, CAST(N'2026-10-03T16:07:33.677' AS DateTime))
INSERT [dbo].[Usuario] ([UserId], [FullName], [Email], [UserType], [Passwrd], [ResetPassword], [CreatedAt]) VALUES (8, N'Michael brown', N'mikeb@ejemplo.com', N'Sales-Person', N'Password123', 0, CAST(N'2026-10-03T16:17:55.500' AS DateTime))
INSERT [dbo].[Usuario] ([UserId], [FullName], [Email], [UserType], [Passwrd], [ResetPassword], [CreatedAt]) VALUES (9, N'Valentina Gomez', N'valgomezo@ejemplo.com', N'Sales-Person', N'Password123', 0, CAST(N'2026-10-03T16:25:44.267' AS DateTime))
INSERT [dbo].[Usuario] ([UserId], [FullName], [Email], [UserType], [Passwrd], [ResetPassword], [CreatedAt]) VALUES (10, N'Alvaro uribe velez', N'alvaro@correo.itm.edu.co', N'Sales-Person', N'Password123', 0, CAST(N'2026-10-06T06:48:37.540' AS DateTime))
INSERT [dbo].[Usuario] ([UserId], [FullName], [Email], [UserType], [Passwrd], [ResetPassword], [CreatedAt]) VALUES (11, N'anibal torres', N'anibaltorres@correo.com', N'Sales-Person', N'Password123', 0, CAST(N'2026-10-24T08:30:34.547' AS DateTime))
INSERT [dbo].[Usuario] ([UserId], [FullName], [Email], [UserType], [Passwrd], [ResetPassword], [CreatedAt]) VALUES (12, N'ratalin', N'ratalin@correo.itm.edu.co', N'Sales-Person', N'Password123', 1, CAST(N'2026-10-24T09:11:07.440' AS DateTime))
SET IDENTITY_INSERT [dbo].[Usuario] OFF
GO
ALTER TABLE [dbo].[Producto] ADD  DEFAULT ((0)) FOR [Stock]
GO
ALTER TABLE [dbo].[Producto] ADD  DEFAULT (getdate()) FOR [CreatedAt]
GO
ALTER TABLE [dbo].[Sale] ADD  DEFAULT (getdate()) FOR [CreatedAt]
GO
ALTER TABLE [dbo].[Usuario] ADD  DEFAULT (getdate()) FOR [CreatedAt]
GO
ALTER TABLE [dbo].[Sale]  WITH CHECK ADD FOREIGN KEY([UserId])
REFERENCES [dbo].[Usuario] ([UserId])
GO
ALTER TABLE [dbo].[SaleDetail]  WITH CHECK ADD FOREIGN KEY([ProductId])
REFERENCES [dbo].[Producto] ([ProductId])
GO
ALTER TABLE [dbo].[SaleDetail]  WITH CHECK ADD FOREIGN KEY([SaleId])
REFERENCES [dbo].[Sale] ([SaleId])
GO
USE [master]
GO
ALTER DATABASE [StoreDB] SET  READ_WRITE 
GO
