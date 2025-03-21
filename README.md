## 安装

```bash
npm i sunshj -g

sun --version
```

## 创建预设模板

```bash
sun create
```

- 配置文件支持JSON/JSONC格式，默认地址：`<homedir>/.sunrc`;
- 支持远程配置文件，使用 `-r`/`--remote` 参数.
- 配置文件格式：

  ```json [.sunrc]
  {
    "templates": [
      {
        // 模板名称
        "name": "ts-starter",
        // 模板地址，基于 [giget](https://github.com/unjs/giget#examples)
        "url": "gh:sunshj/ts-starter",
        // 模板描述
        "description": "A simple starter template for TypeScript projects.",
        // 模板分类
        "category": "Library"
      }
      // ...
    ]
  }
  ```

## 项目配置

```bash
sun config
```

> 在pnpm monorepo中，需要添加`-w`/`--workspace`参数
