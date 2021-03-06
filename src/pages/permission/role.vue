<template>
  <div class="app-container">
    <el-button type="primary" icon="el-icon-plus" @click="handleAdd">新建角色</el-button>
    <el-button class="filter-item" type="primary" icon="el-icon-refresh-left" @click="handleSearch">刷新</el-button>

    <el-table v-loading="tableLoading" :data="list" style="width: 100%;margin-top:30px;" stripe>
      <el-table-column align="center" label="角色名" min-width="150">
        <template slot-scope="{row}">
          {{ row.name }}
        </template>
      </el-table-column>
      <el-table-column align="header-center" label="备注" min-width="200">
        <template slot-scope="{row}">
          {{ row.remark }}
        </template>
      </el-table-column>
      <el-table-column align="right" label="操作" min-width="250">
        <template slot-scope="{row, $index}">
          <el-button type="primary" plain size="mini" @click="handleEdit(row, 'update')">编辑</el-button>
          <el-button type="warning" plain size="mini" @click="handleEdit(row, 'resource')">修改权限</el-button>
          <el-popover
            v-model="row.dialogVisible"
            placement="top"
            width="180"
          >
            <p>您确定要删除此角色吗？</p>
            <div style="text-align: right; margin: 0">
              <el-button size="mini" type="text" @click="hideDialog(row)">取消</el-button>
              <el-button type="primary" size="mini" @click="handleDelete(row, $index)">确定</el-button>
            </div>
            <el-button slot="reference" type="danger" plain size="mini" class="ml-10">删除</el-button>
          </el-popover>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="pagination" />

    <el-dialog :visible.sync="dialogVisible" :title="dialogTitle" :close-on-click-modal="false">
      <el-form ref="dataForm" :model="info" :rules="rules" label-width="80px" label-position="left">
        <el-form-item v-if="dialogType !== 'resource'" label="名称" prop="name">
          <el-input v-model="info.name" placeholder="请输入角色名" />
        </el-form-item>
        <el-form-item v-if="dialogType !== 'resource'" label="备注" prop="remark">
          <el-input
            v-model="info.remark"
            :autosize="{ minRows: 2, maxRows: 4}"
            type="textarea"
            placeholder="角色说明备注"
          />
        </el-form-item>
        <el-form-item v-if="dialogType !== 'update'" label="权限" prop="resourceIds">
          <el-tree
            ref="tree"
            v-model="info.resourceIds"
            :check-strictly="checkStrictly"
            :data="resources"
            :props="defaultProps"
            show-checkbox
            node-key="resource_id"
            class="permission-tree"
          />
        </el-form-item>
      </el-form>
      <div style="text-align:right;">
        <el-button type="danger" @click="dialogVisible=false">取消</el-button>
        <el-button type="primary" @click="handleSave">确定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import table from '@/mixins/table'
import { arrayReplace } from '@/utils'
import { del, add, edit, editResource, getList } from '@/api/permission/role'
import { getTree as getResources } from '@/api/permission/resource'

export default {
  name: 'PermissionRole',
  mixins: [
    table
  ],
  props: {
    systemId: {
      type: Number,
      default() {
        return this.$settings.SYSTEM_MANAGE
      }
    }
  },
  data() {
    return {
      dialogVisible: false,
      dialogType: '',
      roles: [],
      resources: [],
      list: [],
      checkStrictly: false,
      defaultProps: {
        children: 'children',
        label: 'name',
        value: 'resource_id'
      },
      info: {},
      rules: {
        name: [{ required: true, message: '请输入角色名', trigger: 'change' }]
      }
    }
  },
  computed: {
    dialogTitle() {
      switch (this.dialogType) {
        case 'update':
          return '编辑角色'
        case 'resource':
          return '修改权限'
        default:
          return '添加角色'
      }
    }
  },
  created() {
    this.init()
  },
  methods: {
    init() {
      this.loadResource()
      this.loadData()
    },
    loadResource() {
      getResources(this.systemId, 0, 1).then(res => {
        this.resources = res.data
      })
    },
    loadData() {
      getList(this.listQuery.page, this.listQuery.limit, this.systemId).then(res => {
        this.loadedData(res)
      })
    },
    // 重置表单信息
    resetInfo() {
      this.info = {
        name: '',
        code: '',
        remark: '',
        resourceIds: [],
        system_id: this.systemId
      }
      this.$refs.tree && this.$refs.tree.setCheckedKeys([])
    },
    handleAdd() {
      this.resetInfo()
      this.dialogType = 'create'
      this.dialogVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    handleEdit(row, type) {
      this.info = Object.assign({}, row) // copy obj
      this.dialogType = type
      this.dialogVisible = true
      this.$nextTick(() => {
        if (type === 'resource') {
          this.$refs.tree.setCheckedKeys(row.resourceIds, true)
        }
        this.$refs['dataForm'].clearValidate()
      })
    },
    handleSave() {
      this.info.resourceIds = this.$refs.tree ? this.$refs.tree.getCheckedKeys(true) : []
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          if (this.dialogType === 'create') {
            add(this.info).then(res => {
              this.info.role_id = res.data.role_id
              this.list.unshift(Object.assign({}, this.info))
              this.$message.success('添加成功')
              this.dialogVisible = false
            })
          } else if (this.dialogType === 'update') {
            edit(this.info).then(res => {
              this.list = arrayReplace(this.list, 'role_id', this.info)
              this.$message.success('编辑成功')
              this.dialogVisible = false
            })
          } else if (this.dialogType === 'resource') {
            editResource(this.info).then(res => {
              this.list = arrayReplace(this.list, 'role_id', this.info)
              this.$message.success('修改权限成功')
              this.dialogVisible = false
            })
          }
        }
      })
    },
    hideDialog(row) {
      row.dialogVisible = false
    },
    handleDelete(row, index) {
      del(row.role_id).then(res => {
        this.$message.success('删除成功')
        this.hideDialog(row)
        this.$nextTick(() => {
          this.list.splice(index, 1)
        })
      })
    }
  }
}
</script>

<style scoped>

</style>
