# Lab1 Phase 1 — SVG 编辑器（CLI）

仓库目标地址：https://github.com/jackiedu1184800934-dotcom/svg-editor-cli （待发布核验）。

## 架构方案（初稿）

- `src/domain/`：有行为、封装字段的 Shape 类层次、Composite Group、画布树与唯一 ID 约束。
- `src/application/`：Command 接口、每条命令独立类、编辑事务、undo/redo、文件端口。
- `src/infrastructure/`：XML 解析与序列化、磁盘文件适配器。
- `src/cli/`：分词、命令名注册表、REPL 与程序装配。
- `test/`：功能验收、错误原子性、文件往返与架构约束。

依赖：domain 无外部依赖；application → domain；infrastructure → application 端口及 domain；cli → application，入口装配 infrastructure。

采用 Command、Composite、Memento；图形工厂集中注册六种内置类型。只允许命令注册表与图形工厂两处按名字分派，未来插件阶段再将其重构为可注册 Provider。

编辑在深拷贝画布上执行，成功后一次提交并保存前后快照；失败不修改画布及历史。文档操作成功才清空历史并锁定 undo/redo。解锁后的首个编辑只保留新历史。

变化点：后续图形插件扩展工厂；GUI/agent 复用命令；其他存储替换文件端口；大型文档的快照开销后续换增量撤销。目前不实现插件加载、box、GUI。

## 过程记录

1. 阅读需求，确认阶段边界：六类图形；box 不在本阶段实现范围。
2. 创建空仓库与架构初稿，开始记录真实的分阶段开发提交。

## 一致性自查

实现中，最终以实际目录和自动检查结果更新。

## 质量保证手段

计划使用严格 TypeScript 编译、Node 内置测试、CLI 脚本回放、SVG 往返，以及依赖方向/一类一文件检查。
