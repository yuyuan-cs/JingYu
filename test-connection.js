const { createClient } = require('@supabase/supabase-js');

// 您的Supabase配置
const supabaseUrl = 'https://mazslkagknzmoccafzfl.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1henNsa2Fna256bW9jY2FmemZsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE3MjQzMTAsImV4cCI6MjA2NzMwMDMxMH0.2-tXHiz01ll_Us86R3qW_ymDxf-ppA-x2hH20t7W6ns';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  console.log('🔍 测试 Supabase 连接和数据访问...');
  
  try {
    // 测试总数
    const { count, error: countError } = await supabase
      .from('ChengYu')
      .select('*', { count: 'exact', head: true });
    
    if (countError) {
      console.error('❌ 连接失败:', countError.message);
      return;
    }
    
    console.log(`✅ 连接成功！总成语数量: ${count}`);
    
    if (count > 0) {
      // 获取前5条数据
      const { data, error } = await supabase
        .from('ChengYu')
        .select('*')
        .limit(5);
      
      if (error) {
        console.error('❌ 数据获取失败:', error.message);
      } else {
        console.log('📖 示例数据:');
        data.forEach((item, index) => {
          console.log(`${index + 1}. ${item.word || '无'} - ${item.explanation || '无解释'}`);
        });
      }
    }
    
    console.log('\n🎉 测试完成！您的 Supabase 配置正确，可以开始使用 API 了！');
    
  } catch (error) {
    console.error('❌ 测试失败:', error.message);
  }
}

testConnection(); 