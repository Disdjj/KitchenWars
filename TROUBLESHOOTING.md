# 《后厨风云》问题排查与修复

## ✅ 已修复的问题

### 1. 数据库表缺失错误

**错误**: `SQLITE_ERROR: no such table: game_sessions`
**解决**: 运行 `npm run db:push` 创建数据库表

### 2. eventCardId 验证错误

**错误**: `Number must be greater than 0` for eventCardId
**问题**: 初始事件使用了 `id: 0`，但Zod schema要求正整数
**解决**:

- 修改schema允许 `min(0)` 而不是 `positive()`
- 修改初始事件ID从0改为1
- 确保所有临时ID都是正整数

### 3. AI API Key 缺失

**错误**: `Missing GOOGLE_API_KEY environment variable`
**解决**: 添加降级机制，没有API Key时使用预设事件

### 4. Metadata viewport 警告

**警告**: `Unsupported metadata viewport`
**解决**: 将viewport从metadata移动到单独的export

## 🎮 游戏现在应该可以正常运行了！

访问 http://localhost:3001/game 开始游戏。

## 🔧 如果仍有问题

1. **重启开发服务器**：

   ```bash
   npm run dev
   ```

2. **清除缓存**：

   ```bash
   rm -rf .next
   npm run dev
   ```

3. **检查数据库**：

   ```bash
   npm run db:studio
   ```

4. **查看控制台日志**：
   打开浏览器开发者工具查看详细错误信息

## 🎯 游戏功能测试

- ✅ 创建游戏会话
- ✅ 显示初始事件（餐厅理念选择）
- ✅ 左右滑动/点击选择
- ✅ 数值变化和动画
- ✅ 游戏状态更新
- ✅ 结局触发

享受游戏吧！🍳
