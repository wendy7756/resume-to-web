#!/usr/bin/env python3
"""
批量生成blog内容脚本
"""

import requests
import time
import json
import os
import shutil
from datetime import datetime

# API配置
API_BASE_URL = "http://localhost:8080"

# 要生成的主题列表
TOPICS = [
    "free resume templates",
    "acting resume template", 
    "federal resume template",
    "high school resume template",
    "online art portfolio",
    "crear cv online",
    "resume aarp driver safety course online",
    "resume writers online", 
    "resume writing service online",
    "online resume examples"
]

def check_api_health():
    """检查API服务器健康状态"""
    try:
        response = requests.get(f"{API_BASE_URL}/health", timeout=5)
        return response.status_code == 200
    except requests.exceptions.ConnectionError:
        return False
    except requests.exceptions.Timeout:
        return False

def generate_single_content(topic, topic_num, total_topics):
    """生成单个topic的内容"""
    
    print(f"\n{'='*60}")
    print(f"🚀 生成内容 [{topic_num}/{total_topics}]: {topic}")
    print(f"{'='*60}")
    
    # 发起内容生成请求
    print(f"📝 发起生成请求...")
    generate_data = {"topic": topic}
    
    try:
        response = requests.post(f"{API_BASE_URL}/generate", json=generate_data)
        
        if response.status_code != 200:
            print(f"❌ 生成请求失败: {response.text}")
            return False
        
        result = response.json()
        task_id = result['task_id']
        print(f"✅ 任务创建成功! 任务ID: {task_id}")
        
    except Exception as e:
        print(f"❌ 请求失败: {e}")
        return False
    
    # 监控任务进度
    print(f"📊 监控进度...")
    
    max_attempts = 120  # 最多等待10分钟
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
            
            # 每隔几次才打印进度，避免输出过多
            if attempts % 3 == 0:
                print(f"   📊 {progress}% - {message}")
            
            if status == 'completed':
                print(f"✅ 生成完成!")
                
                # 下载并处理文件
                result_info = status_data.get('result', {})
                files = result_info.get('files', [])
                
                if download_and_organize_files(task_id, files, topic):
                    print(f"🎉 '{topic}' 内容已成功添加!")
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
    
    print(f"❌ 任务超时")
    return False

def download_and_organize_files(task_id, files, topic):
    """下载文件并组织到正确的目录"""
    
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
            response = requests.get(download_url)
            
            if response.status_code == 200:
                
                if filename.endswith('.md'):
                    markdown_files.append((filename, response.text))
                    
                elif filename.lower().endswith(('.png', '.jpg', '.jpeg', '.webp')):
                    image_files.append((filename, response.content))
                    
            else:
                print(f"   ❌ 下载失败 {filename}: HTTP {response.status_code}")
                return False
                
        except Exception as e:
            print(f"   ❌ 下载错误 {filename}: {e}")
            return False
    
    # 处理文件命名和关联
    return process_files_with_naming(markdown_files, image_files, blog_dir, assets_blog_dir, topic)

def process_files_with_naming(markdown_files, image_files, blog_dir, assets_blog_dir, topic):
    """处理文件命名和关联"""
    
    for i, (md_filename, md_content) in enumerate(markdown_files):
        # 从markdown内容提取slug作为文件名
        slug = extract_slug_from_content(md_content)
        if not slug:
            # 如果没有slug，基于topic生成
            slug = topic.lower().replace(' ', '-').replace(',', '').replace('/', '-')
        
        # 生成新的文件名
        new_md_filename = f"{slug}.md"
        
        # 查找对应的图片
        image_path = None
        if image_files:
            if i < len(image_files):
                img_filename, img_content = image_files[i]
                img_ext = os.path.splitext(img_filename)[1]
                new_img_filename = f"{slug}{img_ext}"
                
                # 保存图片
                img_path = os.path.join(assets_blog_dir, new_img_filename)
                with open(img_path, 'wb') as f:
                    f.write(img_content)
                
                image_path = f"/assets/blog/{new_img_filename}"
                print(f"   🖼️ 图片已保存: {new_img_filename}")
        
        # 修复frontmatter并更新heroImage
        content = fix_frontmatter(md_content, image_path)
        
        # 保存markdown文件
        md_path = os.path.join(blog_dir, new_md_filename)
        with open(md_path, 'w', encoding='utf-8') as f:
            f.write(content)
        
        print(f"   📝 Markdown已保存: {new_md_filename}")
        
        if image_path:
            print(f"   🔗 已关联图片: {image_path}")
    
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
    
    frontmatter['author'] = 'Wendy'
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
    """主函数 - 批量生成所有内容"""
    
    print("🤖 批量SEO Blog内容生成器")
    print("=" * 60)
    
    # 检查API服务器
    print("🔍 检查API服务器状态...")
    if not check_api_health():
        print("❌ API服务器未启动或无法连接")
        print("请先启动API服务器: python api_server.py")
        return
    
    print("✅ API服务器运行正常")
    print(f"\n📋 准备生成 {len(TOPICS)} 个主题的内容:")
    for i, topic in enumerate(TOPICS, 1):
        print(f"   {i:2d}. {topic}")
    
    # 确认开始
    confirm = input(f"\n🚀 开始批量生成? (y/N): ").strip().lower()
    if confirm != 'y':
        print("👋 已取消")
        return
    
    # 开始生成
    start_time = time.time()
    success_count = 0
    failed_topics = []
    
    for i, topic in enumerate(TOPICS, 1):
        try:
            if generate_single_content(topic, i, len(TOPICS)):
                success_count += 1
            else:
                failed_topics.append(topic)
        except KeyboardInterrupt:
            print(f"\n\n⚠️ 用户中断了批量生成")
            break
        except Exception as e:
            print(f"❌ 生成 '{topic}' 时出错: {e}")
            failed_topics.append(topic)
        
        # 在topic之间稍作休息
        if i < len(TOPICS):
            print(f"\n⏳ 等待3秒后继续下一个...")
            time.sleep(3)
    
    # 总结报告
    end_time = time.time()
    duration = end_time - start_time
    
    print(f"\n{'='*60}")
    print(f"📊 批量生成完成报告")
    print(f"{'='*60}")
    print(f"⏱️ 总耗时: {duration/60:.1f} 分钟")
    print(f"✅ 成功生成: {success_count}/{len(TOPICS)} 个主题")
    
    if failed_topics:
        print(f"❌ 失败的主题:")
        for topic in failed_topics:
            print(f"   - {topic}")
    
    print(f"\n🎉 内容已保存到:")
    print(f"   📝 Markdown: src/content/blog/")
    print(f"   🖼️ 图片: public/assets/blog/")
    print(f"\n💡 提示: 开发服务器会自动重载新内容")

if __name__ == "__main__":
    main()
