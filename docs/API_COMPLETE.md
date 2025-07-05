# 境语 API 接口文档

## 概述

境语 API 为成语学习应用提供完整的后端服务，支持成语管理、用户学习记录、测试系统、成就系统等功能。

## 基本信息

- **Base URL**: `https://api.jingyu.app/v1`
- **协议**: HTTPS
- **数据格式**: JSON
- **字符编码**: UTF-8
- **API 版本**: v1.0.0

## 认证

所有需要用户身份验证的接口都需要在请求头中包含 JWT Token：

```
Authorization: Bearer <your_jwt_token>
```

## 通用响应格式

### 成功响应
```json
{
  "success": true,
  "data": {},
  "message": "操作成功",
  "timestamp": "2024-12-XX 10:00:00"
}
```

### 错误响应
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "错误描述",
    "details": {}
  },
  "timestamp": "2024-12-XX 10:00:00"
}
```

## 错误码说明

| 错误码 | HTTP状态码 | 描述 |
|--------|------------|------|
| `UNAUTHORIZED` | 401 | 未授权访问 |
| `FORBIDDEN` | 403 | 禁止访问 |
| `NOT_FOUND` | 404 | 资源未找到 |
| `VALIDATION_ERROR` | 400 | 参数验证失败 |
| `INTERNAL_ERROR` | 500 | 服务器内部错误 |
| `RATE_LIMITED` | 429 | 请求频率限制 |

---

## 1. 用户认证模块

### 1.1 用户注册

**接口地址**: `POST /auth/register`

**请求参数**:
```json
{
  "username": "string",
  "email": "string",
  "password": "string",
  "confirmPassword": "string"
}
```

**响应示例**:
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_123",
      "username": "testuser",
      "email": "test@example.com",
      "createdAt": "2024-12-XX 10:00:00"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "message": "注册成功"
}
```

### 1.2 用户登录

**接口地址**: `POST /auth/login`

**请求参数**:
```json
{
  "email": "string",
  "password": "string"
}
```

**响应示例**:
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_123",
      "username": "testuser",
      "email": "test@example.com"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "refresh_token_here"
  },
  "message": "登录成功"
}
```

### 1.3 刷新Token

**接口地址**: `POST /auth/refresh`

**请求参数**:
```json
{
  "refreshToken": "string"
}
```

---

## 2. 成语管理模块

### 2.1 获取成语列表

**接口地址**: `GET /idioms`

**查询参数**:
- `page`: 页码 (默认: 1)
- `limit`: 每页数量 (默认: 20, 最大: 100)
- `category`: 分类筛选
- `difficulty`: 难度筛选 (easy|medium|hard)
- `search`: 搜索关键词

**响应示例**:
```json
{
  "success": true,
  "data": {
    "idioms": [
      {
        "id": "idiom_1",
        "idiom": "画龙点睛",
        "pinyin": "huà lóng diǎn jīng",
        "meaning": "原形容梁代画家张僧繇作画的神妙。后多比喻写文章或讲话时，在关键处用几句话点明实质，使内容生动有力。",
        "origin": "唐·张彦远《历代名画记·张僧繇》",
        "example": "这篇文章的结尾很精彩，真是画龙点睛之笔。",
        "similar": ["锦上添花", "妙笔生花"],
        "category": "艺术创作",
        "difficulty": "medium",
        "tags": ["艺术", "写作"],
        "createdAt": "2024-12-XX 10:00:00"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 150,
      "totalPages": 8
    }
  }
}
```

### 2.2 获取成语详情

**接口地址**: `GET /idioms/{id}`

**路径参数**:
- `id`: 成语ID

**响应示例**:
```json
{
  "success": true,
  "data": {
    "id": "idiom_1",
    "idiom": "画龙点睛",
    "pinyin": "huà lóng diǎn jīng",
    "meaning": "原形容梁代画家张僧繇作画的神妙。后多比喻写文章或讲话时，在关键处用几句话点明实质，使内容生动有力。",
    "origin": "唐·张彦远《历代名画记·张僧繇》：\"金陵安乐寺四白龙不点眼睛，每云：'点睛即飞去。'人以为妄诞，固请点之。须臾，雷电破壁，两龙乘云腾去上天，二龙未点眼者见在。\"",
    "example": "这篇文章的结尾很精彩，真是画龙点睛之笔。",
    "similar": ["锦上添花", "妙笔生花"],
    "category": "艺术创作",
    "difficulty": "medium",
    "tags": ["艺术", "写作"],
    "audioUrl": "https://audio.jingyu.app/idiom_1.mp3",
    "relatedStories": [
      {
        "title": "张僧繇画龙的故事",
        "content": "南朝梁代有一位著名画家张僧繇..."
      }
    ],
    "createdAt": "2024-12-XX 10:00:00"
  }
}
```

### 2.3 搜索成语

**接口地址**: `GET /idioms/search`

**查询参数**:
- `q`: 搜索关键词 (必填)
- `type`: 搜索类型 (idiom|pinyin|meaning|origin)
- `page`: 页码
- `limit`: 每页数量

---

## 3. 用户学习记录模块

### 3.1 记录学习行为

**接口地址**: `POST /learning/record`

**请求参数**:
```json
{
  "idiomId": "string",
  "action": "view|study|test|favorite",
  "duration": 30,
  "metadata": {
    "source": "browse|search|recommendation",
    "testScore": 85
  }
}
```

### 3.2 获取学习统计

**接口地址**: `GET /learning/statistics`

**查询参数**:
- `period`: 统计周期 (day|week|month|year)
- `startDate`: 开始日期
- `endDate`: 结束日期

**响应示例**:
```json
{
  "success": true,
  "data": {
    "overview": {
      "totalDays": 45,
      "totalIdioms": 128,
      "currentStreak": 7,
      "longestStreak": 15,
      "averageDaily": 3.2
    },
    "weeklyProgress": [2, 5, 3, 4, 6, 3, 5],
    "categoryProgress": [
      {
        "category": "艺术创作",
        "learned": 25,
        "total": 40,
        "percentage": 62.5
      }
    ],
    "monthlyData": [
      {
        "month": "2024-09",
        "idioms": 32,
        "tests": 8,
        "avgScore": 78.5
      }
    ]
  }
}
```

### 3.3 获取学习进度

**接口地址**: `GET /learning/progress`

**响应示例**:
```json
{
  "success": true,
  "data": {
    "totalProgress": {
      "learned": 73,
      "total": 200,
      "percentage": 36.5
    },
    "categoryProgress": [
      {
        "category": "艺术创作",
        "learned": 25,
        "total": 40,
        "percentage": 62.5
      }
    ],
    "recentlyLearned": [
      {
        "idiomId": "idiom_1",
        "idiom": "画龙点睛",
        "learnedAt": "2024-12-XX 10:00:00"
      }
    ]
  }
}
```

---

## 4. 收藏管理模块

### 4.1 添加收藏

**接口地址**: `POST /favorites`

**请求参数**:
```json
{
  "idiomId": "string"
}
```

### 4.2 取消收藏

**接口地址**: `DELETE /favorites/{idiomId}`

### 4.3 获取收藏列表

**接口地址**: `GET /favorites`

**查询参数**:
- `page`: 页码
- `limit`: 每页数量

**响应示例**:
```json
{
  "success": true,
  "data": {
    "favorites": [
      {
        "id": "fav_1",
        "idiom": {
          "id": "idiom_1",
          "idiom": "画龙点睛",
          "pinyin": "huà lóng diǎn jīng",
          "meaning": "...",
          "category": "艺术创作"
        },
        "favoritedAt": "2024-12-XX 10:00:00"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 23,
      "totalPages": 2
    }
  }
}
```

---

## 5. 测试系统模块

### 5.1 获取测试题目

**接口地址**: `GET /quiz/questions`

**查询参数**:
- `type`: 测试类型 (meaning|pinyin|complete|origin)
- `difficulty`: 难度级别 (easy|medium|hard|expert)
- `count`: 题目数量 (默认: 5, 最大: 20)
- `categories`: 成语分类 (数组)

**响应示例**:
```json
{
  "success": true,
  "data": {
    "quizId": "quiz_123",
    "type": "meaning",
    "difficulty": "medium",
    "timeLimit": 300,
    "questions": [
      {
        "id": "q_1",
        "question": "\"画龙点睛\"的释义是？",
        "options": [
          "原形容梁代画家张僧繇作画的神妙。后多比喻写文章或讲话时，在关键处用几句话点明实质，使内容生动有力。",
          "比喻做事情要有计划，不能盲目行动。",
          "形容文章写得很生动，富有感染力。",
          "比喻在关键时刻起决定性作用。"
        ],
        "correctAnswer": 0,
        "explanation": "\"画龙点睛\"出自张僧繇画龙的典故..."
      }
    ]
  }
}
```

### 5.2 提交测试答案

**接口地址**: `POST /quiz/submit`

**请求参数**:
```json
{
  "quizId": "string",
  "answers": [
    {
      "questionId": "string",
      "selectedAnswer": 0,
      "timeSpent": 15
    }
  ],
  "totalTime": 120
}
```

**响应示例**:
```json
{
  "success": true,
  "data": {
    "quizId": "quiz_123",
    "score": 85,
    "correctCount": 4,
    "totalQuestions": 5,
    "timeSpent": 120,
    "results": [
      {
        "questionId": "q_1",
        "correct": true,
        "selectedAnswer": 0,
        "correctAnswer": 0,
        "timeSpent": 15
      }
    ],
    "newAchievements": [
      {
        "id": "achievement_test_master",
        "title": "测试达人",
        "description": "连续5次测试得分超过80分"
      }
    ]
  }
}
```

### 5.3 获取测试历史

**接口地址**: `GET /quiz/history`

**查询参数**:
- `page`: 页码
- `limit`: 每页数量
- `type`: 测试类型筛选

---

## 6. 成就系统模块

### 6.1 获取成就列表

**接口地址**: `GET /achievements`

**查询参数**:
- `category`: 成就分类 (learning|streak|test|social)
- `status`: 状态筛选 (unlocked|locked|all)

**响应示例**:
```json
{
  "success": true,
  "data": {
    "achievements": [
      {
        "id": "achievement_1",
        "title": "初学乍练",
        "description": "学习第1个成语",
        "category": "learning",
        "difficulty": "bronze",
        "icon": "📚",
        "color": "#4ECDC4",
        "unlocked": true,
        "unlockedAt": "2024-12-XX 10:00:00",
        "progress": {
          "current": 1,
          "target": 1,
          "percentage": 100
        },
        "reward": {
          "type": "title",
          "value": "初学者",
          "description": "获得称号：初学者"
        }
      }
    ],
    "summary": {
      "total": 20,
      "unlocked": 8,
      "locked": 12,
      "percentage": 40
    }
  }
}
```

### 6.2 获取成就详情

**接口地址**: `GET /achievements/{id}`

### 6.3 解锁成就

**接口地址**: `POST /achievements/{id}/unlock`

---

## 7. 推荐系统模块

### 7.1 获取个性化推荐

**接口地址**: `GET /recommendations`

**查询参数**:
- `type`: 推荐类型 (daily|similar|difficulty|category)
- `limit`: 推荐数量

**响应示例**:
```json
{
  "success": true,
  "data": {
    "recommendations": [
      {
        "id": "rec_1",
        "type": "daily",
        "title": "今日推荐",
        "reason": "基于你的学习偏好",
        "idioms": [
          {
            "id": "idiom_1",
            "idiom": "画龙点睛",
            "confidence": 0.95,
            "reason": "与你最近学习的成语相似"
          }
        ]
      }
    ]
  }
}
```

---

## 8. 设置管理模块

### 8.1 获取用户设置

**接口地址**: `GET /settings`

**响应示例**:
```json
{
  "success": true,
  "data": {
    "notifications": {
      "pushEnabled": true,
      "dailyReminder": true,
      "studyReminder": true,
      "reminderTime": "09:00"
    },
    "preferences": {
      "theme": "light",
      "language": "zh-CN",
      "soundEffects": true,
      "autoDownload": false
    },
    "privacy": {
      "dataCollection": true,
      "analytics": true
    }
  }
}
```

### 8.2 更新用户设置

**接口地址**: `PUT /settings`

**请求参数**:
```json
{
  "notifications": {
    "pushEnabled": true,
    "dailyReminder": true,
    "reminderTime": "09:00"
  },
  "preferences": {
    "theme": "dark",
    "soundEffects": false
  }
}
```

---

## 9. 数据同步模块

### 9.1 同步用户数据

**接口地址**: `POST /sync`

**请求参数**:
```json
{
  "lastSyncTime": "2024-12-XX 10:00:00",
  "data": {
    "learningRecords": [],
    "favorites": [],
    "testResults": [],
    "settings": {}
  }
}
```

### 9.2 获取增量数据

**接口地址**: `GET /sync/delta`

**查询参数**:
- `since`: 上次同步时间

---

## 10. 系统信息模块

### 10.1 获取应用信息

**接口地址**: `GET /app/info`

**响应示例**:
```json
{
  "success": true,
  "data": {
    "version": "1.0.0",
    "buildNumber": "100",
    "apiVersion": "v1",
    "features": ["quiz", "achievements", "recommendations"],
    "maintenance": {
      "scheduled": false,
      "message": ""
    },
    "updateInfo": {
      "available": false,
      "version": "1.0.1",
      "required": false,
      "url": "https://app.jingyu.app/update"
    }
  }
}
```

### 10.2 健康检查

**接口地址**: `GET /health`

**响应示例**:
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "timestamp": "2024-12-XX 10:00:00",
    "services": {
      "database": "healthy",
      "cache": "healthy",
      "storage": "healthy"
    }
  }
}
```

---

## 请求限制

| 接口类型 | 限制 |
|----------|------|
| 认证接口 | 10 次/分钟 |
| 查询接口 | 100 次/分钟 |
| 写入接口 | 50 次/分钟 |
| 测试接口 | 20 次/分钟 |

## SDK 示例

### JavaScript/TypeScript

```typescript
import { JingYuAPI } from '@jingyu/api-client';

const api = new JingYuAPI({
  baseURL: 'https://api.jingyu.app/v1',
  apiKey: 'your_api_key'
});

// 获取成语列表
const idioms = await api.idioms.list({ 
  page: 1, 
  limit: 20,
  category: '艺术创作'
});

// 记录学习行为
await api.learning.record({
  idiomId: 'idiom_1',
  action: 'study',
  duration: 30
});
```

## 更新日志

### v1.0.0 (2024-12-XX)
- 初始版本发布
- 支持成语管理、学习记录、测试系统
- 实现成就系统和推荐功能
- 提供完整的用户认证和设置管理