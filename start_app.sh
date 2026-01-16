#!/bin/bash
TARGET_PORT=7860

# 端口检测函数 - 多工具兼容
find_pid_by_port() {
    local port=$1
    command -v ss &> /dev/null && ss -tlnp "sport = :${port}" 2>/dev/null | grep -oE 'pid=[0-9]+' | cut -d= -f2 | head -1 && return 0
    command -v lsof &> /dev/null && lsof -ti ":${port}" 2>/dev/null | head -1 && return 0
    command -v netstat &> /dev/null && netstat -tlnp 2>/dev/null | grep ":${port}" | grep LISTEN | grep -oE '[0-9]+/' | cut -d/ -f1 | head -1 && return 0
    return 1
}

# 终止占用进程
terminate_pid() {
    local pid=$1
    echo "[BananaMall] 终止进程 $pid..."
    kill "$pid" 2>/dev/null || true
    sleep 2
    kill -9 "$pid" 2>/dev/null || true
}

# 主流程
echo "[BananaMall] 检查端口 ${TARGET_PORT}..."
pid=$(find_pid_by_port "$TARGET_PORT")
if [[ -n "$pid" ]]; then
    terminate_pid "$pid"
fi
sleep 2
echo "[BananaMall] 启动 Vite 开发服务器 (端口 ${TARGET_PORT})..."
exec npm run dev
