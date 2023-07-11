---
title: 模板
date: 2023-05-14 08:06:15
type: "wheels"
---

### 快读

```C++
inline int read()
{
    int x = 0, f = 1;
    char ch = getchar();
    while(ch < '0' || ch > '9'){
        if(ch == '-')
            f = -1;
        ch = getchar();
    }
    while(ch >= '0' && ch <= '9'){
        x = x * 10 + ch - '0';
        ch = getchar();
    }
    return x * f;
}
```

### 快输

```C++
inline void print(int x)
{
    if(x < 0){
        putchar('-');
        x = -x;
    }
    if(x > 9)
        print(x / 10);
    putchar(x % 10 + '0');
}
```

### SCC

```C++
vector<vector<int>> g(N); // node_vector

namespace SCC
{
    vector<vector<int>> scc;
    // dfs_list / all_up / scc_style / now_crd
    int dfn[N], up[N], bel[N], crd = 0;
    // node_list / list_crd
    int stk[N], top = 0;
    bool vis[N];

    void dfs(int x)
    {
        dfn[x] = up[x] = ++crd; // init x
        stk[++top] = x; // enter x
        vis[x] = true;
        for(int y : g[x])
        {
            if(!dfn[y]) // y not have
            {
                dfs(y);
                up[x] = min(up[x], up[y]);
            }
            else
                if(vis[y]) up[x] = min(up[x], up[y]);
        }
        if(dfn[x] == up[x]) // if x == x
        {
            vector<int> c; // make a new scc
            while(true)
            {
                int y = stk[top--]; // pop stk
                vis[y] = false; // cut y
                bel[y] = scc.size();
                c.push_back(y);
                if(y == x) break;
            }
            scc.push_back(c);
        }
    }
}
```

### e_DCC

```C++
namespace e_DCC
{
    vector<int> dcc;
    int dfn[N], up[N], crd = 0;

    void dfs(int x, int from)
    {
        dfn[x] = up[x] = ++crd;
        for(int i = head[x]; i; i = edge[i].nxt)
        {
            int y = edge[i].ver;
            if(!dfn[y])
            {
                dfs(y, i); 
                up[x] = min(up[x], up[y]);
                if(up[y] > dfn[x])
                    dcc.push_back(i);
            }
            else if (i != (from ^ 1))
                up[x] = min(up[x], up[y]);
        }
    }
}
```

### v_DCC

```C++
bool cut[N]; // 第i个结点是不是割点

namespace v_DCC
{
    int dfn[N], up[N], crd = 0;
    bool cut[N];

    void dfs(int x, int from)
    {
        dfn[x] = up[x] = ++crd; // init x
        int ch = 0;
        for(int i = head[x]; i; i = edge[i].nxt)
        {
            int y = edge[i].ver;
            if(!dfn[y]) // y not have
            {
                dfs(y, i); ch++;
                up[x] = min(up[x], up[y]);
                if(up[y] >= dfn[x]) cut[x] = true;
            }
            else if (i != (from ^ 1))
                up[x] = min(up[x], dfn[y]);
        }
        if(from == 0 && ch <= 1) cut[x] = false;
        ans += cut[x];
    }
}
```

### Dijkstra

```C++
#include <algorithm>
#include <cstring>
#include <queue>
#include <cmath>
#define MAX 10000
int head[MAX]; //代表一个结点，也是子结点链的起点
int edge[MAX]; //储存边的值
int son[MAX]; //子结点链
int ver[MAX]; //代表有向边
int dist[MAX]; //最短路
bool tag[MAX]; //标记结点
int tot = 0; // 边的数量
using namespace std;
//pair的第一维是dist的相反数（把大根堆转换成小根堆）
//pair的第二维是结点下标
priority_queue<pair<int int>> q; //用二叉堆存结点
void Dijkstra()
{
    memset(dist, 0x3f, sizeof(dist)); //初始化dist
    memset(tag, 0, sizeof(tag)); //初始化tag
    dist[1] = 0; //设置起点
    q.push(make_pair(0, 1)); //把起点加入二叉堆
    //一直计算直到队列为空
    while(q.size())
    {
        int crd = q.top().second; //父结点下标
        q.pop(); //移出二叉堆
        if(tag[crd]) continue; //确保此结点没有被扩展过
        tag[crd] = true; //标记已经走过的点
        //遍历此结点的子结点
        for(int j = head[crd]; j; j = son[j])
        {
            if(dist[crd] + edge[j] < dist[ne])
            {
                 dist[ne] = dist[crd] + edge[j]; //更新子结点的dist
                 q.push(make_pair(-dist[ne], ne)); //把新的二元组插入堆
            }
        }
    }
    return;
}
```

### SPFA

```C++
#include <algorithm>
#include <cstring>
#include <queue>
#include <cmath>
#define MAX 10000
int head[MAX]; //代表一个结点，也是子结点链的起点
int edge[MAX]; //储存边的值
int son[MAX]; //子结点链
int ver[MAX]; //代表有向边
int dist[MAX]; //最短路
bool tag[MAX]; //标记结点
int tot = 0; //边的数量
int N;
using namespace std;
void BellmonFord()
{
    memset(dist, 0x3f, sizeof(dist)); //初始化dist
    dist[1] = 0; //设置起点
    queue<int> q; //定义队列，存储可能改变的结点
    q.push(1); //把起点添加进队列
    tag[1] = true; //打上标记
    while (!q.empty()) //一直循环，直到队列为空
    {
        int crd = q.front(); //从队列中取一个结点
        q.pop(); //移出队列
        tag[crd] = false; //去掉标记
        //遍历连接crd的子节点
        for(int j = head[crd]; j; j = son[j])
        {
            int ne = ver[j];
            if(dist[crd] + edge[j] < dist[ne])
            {
                dist[ne] = dist[crd] + edge[j];
                if(!tag[ne]) //如果子节点并不在队列中
                {
                    q.push(ne); //加入队列
                    tag[ne] = true; //打上标记
                }
            }
        }
    }
    return;
}
```

### Floyd

```C++
int dist[100][100]; //初始化dist数组
for (int k = 0; k < v; k++)
{
    for (int i = 0; i < v; i++)
    {
        for (int j = 0; j < v; j++)
        {
            dist[i][j] = min(dist[i][j], dist[i][k] + dist[k][j]);
        }
    }
}
```

