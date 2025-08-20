#!/usr/bin/env python3
"""
SEO Content API 调用脚本
自动生成blog内容并放入正确的目录结构
"""

import requests
import time
import json
import os
import shutil
from datetime import datetime

# API配置
API_BASE_URL = "http://localhost:8080"

def check_api_health():
    """检查API服务器健康状态"""
    try:
        response = requests.get(f"{API_BASE_URL}/health", timeout=5)
        return response.status_code == 200
    except requests.exceptions.ConnectionError:
        return False
    except requests.exceptions.Timeout:
        return False

def generate_blog_content(topic):
    """生成blog内容"""
    
    print(f"🚀 开始生成blog内容...")
    print(f"📝 主题: {topic}")
    
    # 1. 健康检查
    print("\n1. 检查API服务器状态...")
    if not check_api_health():
        print("❌ API服务器未启动或无法连接")
        print("请先启动API服务器: python api_server.py")
        return False
    
    print("✅ API服务器运行正常")
    
    # 2. 发起内容生成请求
    print("\n2. 发起内容生成请求...")
    generate_data = {"topic": topic}
    
    try:
        response = requests.post(f"{API_BASE_URL}/generate", json=generate_data)
        
        if response.status_code != 200:
            print(f"❌ 生成请求失败: {response.text}")
            return False
        
        result = response.json()
        task_id = result['task_id']
        print(f"✅ 任务创建成功!")
        print(f"   任务ID: {task_id}")
        
    except Exception as e:
        print(f"❌ 请求失败: {e}")
        return False
    
    # 3. 监控任务进度
    print("\n3. 监控生成进度...")
    
    max_attempts = 60  # 最多等待5分钟
    attempts = 0
    
    while attempts < max_attempts:
        try:
            response = requests.get(f"{API_BASE_URL}/status/{task_id}")
            
            if response.status_code != 200:
                print(f"❌ 状态查询失败: {response.text}")
                return False
                
            status_data = response.json()
            status = status_data['status']
            progress = status_data['progress']
            message = status_data['message']
            
            print(f"   📊 进度: {progress}% - {message}")
            
            if status == 'completed':
                print("✅ 内容生成完成!")
                
                # 下载并处理文件
                result_info = status_data.get('result', {})
                files = result_info.get('files', [])
                
                if download_and_organize_files(task_id, files):
                    print("🎉 Blog内容已成功添加到项目中!")
                    return True
                else:
                    return False
                    
            elif status == 'error':
                print(f"❌ 生成失败: {status_data.get('error', '未知错误')}")
                return False
                
        except Exception as e:
            print(f"❌ 状态查询错误: {e}")
            return False
        
        # 等待5秒再检查
        time.sleep(5)
        attempts += 1
    
    print("❌ 任务超时")
    return False

def download_and_organize_files(task_id, files):
    """下载文件并组织到正确的目录"""
    
    print(f"\n4. 下载并组织文件...")
    
    # 确保目录存在
    blog_dir = "src/content/blog"
    assets_blog_dir = "public/assets/blog"
    
    os.makedirs(blog_dir, exist_ok=True)
    os.makedirs(assets_blog_dir, exist_ok=True)
    
    markdown_files = []
    image_files = []
    
    # 下载所有文件
    for file_info in files:
        filename = file_info['filename']
        download_url = f"{API_BASE_URL}/download/{task_id}/{filename}"
        
        try:
            print(f"   📥 下载 {filename}...")
            response = requests.get(download_url)
            
            if response.status_code == 200:
                
                if filename.endswith('.md'):
                    # Markdown文件处理
                    content = response.text
                    markdown_files.append((filename, content))
                    print(f"   ✅ Markdown内容已获取: {filename}")
                    
                elif filename.lower().endswith(('.png', '.jpg', '.jpeg', '.webp')):
                    # 图片文件处理
                    image_files.append((filename, response.content))
                    print(f"   ✅ 图片内容已获取: {filename}")
                    
            else:
                print(f"   ❌ 下载失败 {filename}: HTTP {response.status_code}")
                return False
                
        except Exception as e:
            print(f"   ❌ 下载错误 {filename}: {e}")
            return False
    
    # 处理文件命名和关联
    return process_files_with_naming(markdown_files, image_files, blog_dir, assets_blog_dir)

def process_files_with_naming(markdown_files, image_files, blog_dir, assets_blog_dir):
    """处理文件命名和关联"""
    
    print(f"\n5. 处理文件命名和关联...")
    
    saved_files = []
    
    for i, (md_filename, md_content) in enumerate(markdown_files):
        # 从markdown内容提取slug作为文件名
        slug = extract_slug_from_content(md_content)
        if not slug:
            # 如果没有slug，使用原文件名（去掉扩展名）
            slug = os.path.splitext(md_filename)[0].replace('api_', '').replace('_', '-')
        
        # 生成新的文件名
        new_md_filename = f"{slug}.md"
        
        # 查找对应的图片
        image_path = None
        if image_files:
            # 如果有图片，使用相同的slug命名
            if i < len(image_files):
                img_filename, img_content = image_files[i]
                img_ext = os.path.splitext(img_filename)[1]
                new_img_filename = f"{slug}{img_ext}"
                
                # 保存图片
                img_path = os.path.join(assets_blog_dir, new_img_filename)
                with open(img_path, 'wb') as f:
                    f.write(img_content)
                
                image_path = f"/assets/blog/{new_img_filename}"
                print(f"   ✅ 图片已保存: {img_path}")
        
        # 修复frontmatter并更新heroImage
        content = fix_frontmatter(md_content, image_path)
        
        # 保存markdown文件
        md_path = os.path.join(blog_dir, new_md_filename)
        with open(md_path, 'w', encoding='utf-8') as f:
            f.write(content)
        
        saved_files.append(md_path)
        print(f"   ✅ Markdown已保存: {md_path}")
        
        if image_path:
            print(f"   🔗 已关联图片: {image_path}")
    
    print(f"\n📊 文件统计:")
    print(f"   📝 Markdown文件: {len(markdown_files)}")
    print(f"   🖼️  图片文件: {len(image_files)}")
    
    return True

def extract_slug_from_content(content):
    """从markdown内容中提取slug"""
    lines = content.split('\n')
    for line in lines:
        if line.startswith('slug:'):
            slug = line.split(':', 1)[1].strip().strip('"\'')
            return slug
    return None

def fix_frontmatter(content, image_path=None):
    """修复frontmatter格式以符合我们的schema"""
    
    lines = content.split('\n')
    
    if len(lines) < 3 or lines[0] != '---':
        return content
    
    # 找到frontmatter结束位置
    end_idx = -1
    for i, line in enumerate(lines[1:], 1):
        if line == '---':
            end_idx = i
            break
    
    if end_idx == -1:
        return content
    
    frontmatter_lines = lines[1:end_idx]
    body_lines = lines[end_idx+1:]
    
    # 解析现有frontmatter
    frontmatter = {}
    for line in frontmatter_lines:
        if ':' in line:
            key, value = line.split(':', 1)
            frontmatter[key.strip()] = value.strip().strip('"\'')
    
    # 确保必需字段存在
    if 'date' not in frontmatter:
        frontmatter['date'] = datetime.now().strftime('%Y-%m-%d')
    
    if 'author' not in frontmatter:
        frontmatter['author'] = 'Wendy'
    
    if 'robots' not in frontmatter:
        frontmatter['robots'] = '"index, follow"'
    
    # 更新canonical_url为我们的域名
    if 'canonical_url' in frontmatter:
        slug = frontmatter.get('slug', '')
        if slug:
            frontmatter['canonical_url'] = f'https://resumelink.cloud/{slug}'
    
    # 如果提供了图片路径，更新heroImage
    if image_path:
        frontmatter['heroImage'] = image_path
    elif 'heroImage' not in frontmatter:
        # 如果没有图片也没有heroImage，使用默认图片
        frontmatter['heroImage'] = '/assets/stock-1.jpg'
    
    # 重新构建frontmatter
    new_frontmatter = ['---']
    
    # 按我们的标准顺序添加字段
    field_order = ['title', 'description', 'keywords', 'slug', 'canonical_url', 'robots', 'author', 'date', 'heroImage']
    
    for field in field_order:
        if field in frontmatter:
            value = frontmatter[field]
            if field in ['title', 'description', 'keywords', 'robots'] and not (value.startswith('"') and value.endswith('"')):
                value = f'"{value}"'
            new_frontmatter.append(f'{field}: {value}')
    
    new_frontmatter.append('---')
    
    # 重新组合内容
    return '\n'.join(new_frontmatter + [''] + body_lines)

def main():
    """主函数"""
    print("🤖 SEO Blog Content Generator")
    print("=" * 50)
    
    # 可以在这里修改要生成的主题
    topics = [
        "Resume Writing Tips for 2025",
        "How to Build a Professional Portfolio Website",
        "Job Interview Preparation Strategies",
        "Career Change Guide for Professionals",
        "Remote Work Resume Best Practices"
    ]
    
    print("📋 可选主题:")
    for i, topic in enumerate(topics, 1):
        print(f"   {i}. {topic}")
    
    try:
        choice = input("\n请选择主题编号 (1-5) 或输入自定义主题: ").strip()
        
        if choice.isdigit() and 1 <= int(choice) <= len(topics):
            selected_topic = topics[int(choice) - 1]
        else:
            selected_topic = choice
        
        if not selected_topic:
            print("❌ 未选择主题")
            return
            
        # 生成内容
        success = generate_blog_content(selected_topic)
        
        if success:
            print("\n🎉 内容生成完成! 请检查以下目录:")
            print("   📝 Markdown: src/content/blog/")
            print("   🖼️  图片: public/assets/blog/")
            print("\n💡 提示: 开发服务器会自动重载新内容")
        else:
            print("\n❌ 内容生成失败")
            
    except KeyboardInterrupt:
        print("\n\n👋 已取消")
    except Exception as e:
        print(f"\n❌ 错误: {e}")

if __name__ == "__main__":
    main()
