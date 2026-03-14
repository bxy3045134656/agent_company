/**
 * Finance 模型
 * 财务管理 - 收入、成本、利润
 */

const fs = require('fs');
const path = require('path');

class Finance {
  constructor() {
    this.dataFile = path.join(__dirname, '../../data/finance.json');
    this.ensureDataFile();
  }

  // 确保数据文件存在
  ensureDataFile() {
    const dataDir = path.dirname(this.dataFile);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    if (!fs.existsSync(this.dataFile)) {
      const initialData = {
        incomes: this.initIncomes(),
        costs: this.initCosts(),
        profits: []
      };
      fs.writeFileSync(this.dataFile, JSON.stringify(initialData, null, 2));
    }
  }

  // 初始化示例收入数据
  initIncomes() {
    return [
      {
        id: '1',
        type: 'project',
        category: '软件开发',
        amount: 50000,
        date: '2026-03-01',
        description: 'Agent Company 项目开发',
        client: '内部项目'
      },
      {
        id: '2',
        type: 'project',
        category: 'AI 咨询',
        amount: 15000,
        date: '2026-03-05',
        description: 'AI 技术方案咨询',
        client: '外部客户'
      },
      {
        id: '3',
        type: 'service',
        category: '技术服务',
        amount: 8000,
        date: '2026-03-10',
        description: '系统维护服务',
        client: '长期客户'
      },
      {
        id: '4',
        type: 'project',
        category: '软件开发',
        amount: 32000,
        date: '2026-03-12',
        description: '网站开发项目',
        client: '企业客户'
      }
    ];
  }

  // 初始化示例成本数据
  initCosts() {
    return [
      {
        id: '1',
        type: 'labor',
        category: '人力成本',
        amount: 20000,
        date: '2026-03-01',
        description: '开发人员工资',
        payer: '小软'
      },
      {
        id: '2',
        type: 'labor',
        category: '人力成本',
        amount: 15000,
        date: '2026-03-01',
        description: '测试人员工资',
        payer: '小测'
      },
      {
        id: '3',
        type: 'labor',
        category: '人力成本',
        amount: 25000,
        date: '2026-03-01',
        description: '管理者工资',
        payer: '白小白'
      },
      {
        id: '4',
        type: 'infrastructure',
        category: '基础设施',
        amount: 5000,
        date: '2026-03-05',
        description: '服务器费用',
        payer: 'AWS'
      },
      {
        id: '5',
        type: 'software',
        category: '软件订阅',
        amount: 2000,
        date: '2026-03-10',
        description: '开发工具订阅',
        payer: 'GitHub/Microsoft'
      }
    ];
  }

  // 读取数据
  loadData() {
    const content = fs.readFileSync(this.dataFile, 'utf-8');
    return JSON.parse(content);
  }

  // 保存数据
  saveData(data) {
    fs.writeFileSync(this.dataFile, JSON.stringify(data, null, 2));
  }

  // ========== 收入相关方法 ==========

  // 获取所有收入（支持筛选）
  getAllIncomes(filters = {}) {
    const data = this.loadData();
    let incomes = data.incomes;

    if (filters.category) {
      incomes = incomes.filter(item => item.category === filters.category);
    }
    if (filters.startDate) {
      incomes = incomes.filter(item => item.date >= filters.startDate);
    }
    if (filters.endDate) {
      incomes = incomes.filter(item => item.date <= filters.endDate);
    }

    return incomes.sort((a, b) => new Date(b.date) - new Date(a.date));
  }

  // 获取收入统计
  getIncomeStats() {
    const data = this.loadData();
    const incomes = data.incomes;

    const total = incomes.reduce((sum, item) => sum + item.amount, 0);
    
    // 按分类统计
    const byCategory = {};
    incomes.forEach(item => {
      if (!byCategory[item.category]) {
        byCategory[item.category] = 0;
      }
      byCategory[item.category] += item.amount;
    });

    // 按趋势统计（按月）
    const byMonth = {};
    incomes.forEach(item => {
      const month = item.date.substring(0, 7); // YYYY-MM
      if (!byMonth[month]) {
        byMonth[month] = 0;
      }
      byMonth[month] += item.amount;
    });

    return {
      total,
      byCategory,
      byMonth,
      count: incomes.length
    };
  }

  // 创建收入记录
  createIncome(incomeData) {
    const data = this.loadData();
    const newIncome = {
      id: Date.now().toString(),
      type: 'project',
      ...incomeData,
      createdAt: new Date().toISOString()
    };
    data.incomes.push(newIncome);
    this.saveData(data);
    return newIncome;
  }

  // ========== 成本相关方法 ==========

  // 获取所有成本（支持筛选）
  getAllCosts(filters = {}) {
    const data = this.loadData();
    let costs = data.costs;

    if (filters.category) {
      costs = costs.filter(item => item.category === filters.category);
    }
    if (filters.startDate) {
      costs = costs.filter(item => item.date >= filters.startDate);
    }
    if (filters.endDate) {
      costs = costs.filter(item => item.date <= filters.endDate);
    }

    return costs.sort((a, b) => new Date(b.date) - new Date(a.date));
  }

  // 获取成本统计
  getCostStats() {
    const data = this.loadData();
    const costs = data.costs;

    const total = costs.reduce((sum, item) => sum + item.amount, 0);
    
    // 按分类统计
    const byCategory = {};
    costs.forEach(item => {
      if (!byCategory[item.category]) {
        byCategory[item.category] = 0;
      }
      byCategory[item.category] += item.amount;
    });

    // 按趋势统计（按月）
    const byMonth = {};
    costs.forEach(item => {
      const month = item.date.substring(0, 7);
      if (!byMonth[month]) {
        byMonth[month] = 0;
      }
      byMonth[month] += item.amount;
    });

    return {
      total,
      byCategory,
      byMonth,
      count: costs.length
    };
  }

  // 创建成本记录
  createCost(costData) {
    const data = this.loadData();
    const newCost = {
      id: Date.now().toString(),
      type: 'labor',
      ...costData,
      createdAt: new Date().toISOString()
    };
    data.costs.push(newCost);
    this.saveData(data);
    return newCost;
  }

  // ========== 利润相关方法 ==========

  // 获取利润分析
  getProfitAnalysis() {
    const incomeStats = this.getIncomeStats();
    const costStats = this.getCostStats();

    const totalProfit = incomeStats.total - costStats.total;
    const profitMargin = incomeStats.total > 0 
      ? ((totalProfit / incomeStats.total) * 100).toFixed(2) 
      : 0;

    // 按月份计算利润趋势
    const allMonths = new Set([
      ...Object.keys(incomeStats.byMonth),
      ...Object.keys(costStats.byMonth)
    ]);

    const profitTrend = Array.from(allMonths).sort().map(month => ({
      month,
      income: incomeStats.byMonth[month] || 0,
      cost: costStats.byMonth[month] || 0,
      profit: (incomeStats.byMonth[month] || 0) - (costStats.byMonth[month] || 0)
    }));

    return {
      totalProfit,
      profitMargin,
      totalIncome: incomeStats.total,
      totalCost: costStats.total,
      trend: profitTrend
    };
  }

  // 导出财务报表
  exportReport(startDate, endDate) {
    const incomeStats = this.getIncomeStats();
    const costStats = this.getCostStats();
    const profitAnalysis = this.getProfitAnalysis();

    return {
      reportDate: new Date().toISOString(),
      period: { startDate, endDate },
      summary: {
        totalIncome: incomeStats.total,
        totalCost: costStats.total,
        totalProfit: profitAnalysis.totalProfit,
        profitMargin: profitAnalysis.profitMargin
      },
      incomeDetails: this.getAllIncomes({ startDate, endDate }),
      costDetails: this.getAllCosts({ startDate, endDate }),
      profitTrend: profitAnalysis.trend
    };
  }
}

module.exports = new Finance();
