<template>
  <div class="app-container">
    <!-- 筛选 -->
    <div class="filter-container">
      <el-input v-model="search.user_name" placeholder="关键字搜索" style="width: 200px;" class="filter-item" clearable />
      <el-button class="filter-item" type="primary" icon="el-icon-search" @click="handleSearch">搜索</el-button>
    </div>
    <!-- 表格 -->
    <el-table :data="list" border style="width: 100%">
      <el-table-column prop="user_id" label="用户ID" width="100"></el-table-column>
      <el-table-column prop="user_name" label="用户名" width="180"></el-table-column>
      <el-table-column prop="display_balance" label="总余额"></el-table-column>
      <el-table-column prop="display_available_balance" label="可用余额"></el-table-column>
      <el-table-column prop="display_debt" label="平台欠款"></el-table-column>
      <el-table-column prop="display_freeze" label="冻结金额"></el-table-column>
      <el-table-column prop="display_cash" label="提现金额"></el-table-column>
      <el-table-column prop="display_settled" label="待结算金额"></el-table-column>
      <el-table-column label="状态">
        <template slot-scope="{row}">
          {{ accountState[row.state] }}
        </template>
      </el-table-column>
      <el-table-column prop="created_at" label="创建时间"></el-table-column>
      <el-table-column align="center" label="操作" min-width="60">
        <template slot-scope="{row}">
          <el-button type="primary" size="mini" @click="handleBalance(row)">余额操作</el-button>
        </template>
      </el-table-column>
    </el-table>
    <!-- 分页 -->
    <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="pagination" />

    <el-dialog :visible.sync="balanceVisible" title="余额管理" :close-on-click-modal="false" width="430px">
      <el-form ref="dataForm" :model="info" :rules="rules" label-width="80px" label-position="right">
        <el-form-item label="余额" prop="balance">
          <el-input v-model="info.display_balance" auto-complete="off" placeholder="请输入余额" @input="change" />
        </el-form-item>
      </el-form>
      <div style="text-align:right;">
        <el-button type="danger" @click="balanceVisible=false">取消</el-button>
        <el-button type="primary" @click="handleEdit">修改</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import table from '@/mixins/table'
import { search, getBalance, addBalance } from '@/api/account/index'
import { accountState } from '@/utils/const'
import { arrayReplace } from '@/utils'
import { validateNumber } from '@/utils/validate'

export default {
  name: 'AccountManager',
  mixins: [
    table
  ],
  data() {
    return {
      listQuery: {
        limit: 10
      },
      list: [],
      balanceVisible: false,
      accountState,
      search: {},
      info: {},
      rules: {
        balance: [{ required: true, message: '请输入余额', trigger: 'blur', validator: validateNumber }]
      }
    }
  },
  created() {
    this.init()
  },
  methods: {
    init() {
      this.loadData()
    },
    change() {
      this.$forceUpdate()
    },
    loadData() {
      search(this.listQuery.page, this.listQuery.limit, JSON.stringify(this.search)).then(res => {
        this.loadedData(res)
      })
    },
    handleBalance(row) {
      this.info = Object.assign({}, row) // copy obj
      this.balanceVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    handleEdit() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          addBalance(this.info.user_id, this.info.display_balance).then(res => {
            this.$message.success('编辑成功')
            this.balanceVisible = false
          }).then(res => {
            getBalance(this.info.user_id).then(res => {
              this.info.display_balance = res.data.balance / 100
              this.info.available_balance = res.data.available_balance
              this.list = arrayReplace(this.list, 'fund_account_id', this.info)
            })
          })
        }
      })
    }
  }
}
</script>

<style scoped>

</style>
