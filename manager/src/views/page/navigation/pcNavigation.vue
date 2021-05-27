<template>
    <div class="search">
                <Card>
                    <Row class="operation">
                        <Button @click="add" type="primary" icon="md-add">添加</Button>
                        <Button @click="disableAll" icon="md-trash">批量禁用</Button>
                        <Button @click="getDataList" icon="md-refresh">刷新</Button>
                        <Button type="dashed" @click="openTip=!openTip">{{openTip ? "关闭提示" : "开启提示"}}</Button>
                    </Row>
                    <Row v-show="openTip">
                        <Alert show-icon>
                            已选择 <span class="select-count">{{selectCount}}</span> 项
                            <a class="select-clear" @click="clearSelectAll">清空</a>
                        </Alert>
                    </Row>
                    <Table :loading="loading" border :columns="columns" :data="data" ref="table" sortable="custom"
                            @on-sort-change="changeSort" @on-selection-change="changeSelect"></Table>
                    <Row type="flex" justify="end" class="page">
                        <Page :current="searchForm.pageNumber" :total="total" :page-size="searchForm.pageSize"
                              @on-change="changePage" @on-page-size-change="changePageSize" :page-size-opts="[10,20,50]"
                              size="small" show-total show-elevator show-sizer></Page>
                    </Row>
                </Card>
        <Modal :title="modalTitle" v-model="modalVisible" :mask-closable='false' :width="500">
            <Form ref="form" :model="form" :label-width="100" :rules="formValidate">
                <FormItem label="导航栏名称" prop="navigationName">
                    <Input v-model="form.navigationName" clearable style="width:100%"/>
                </FormItem>
                <FormItem label="导航栏链接" prop="url">
                    <Input v-model="form.url" clearable style="width:100%"/>
                </FormItem>
                <FormItem label="品牌图标" prop="image">
                    <upload-pic-input v-model="form.image" style="width:100%"></upload-pic-input>
                </FormItem>
            </Form>
            <div slot="footer">
                <Button type="text" @click="modalVisible=false">取消</Button>
                <Button type="primary" :loading="submitLoading" @click="handleSubmit">提交</Button>
            </div>
        </Modal>
    </div>
</template>

<script>
    import {
        save,
        getNavigationData,
        disableNavigation,
        enableNavigation,
        delNavigation,
        update
    } from "@/api/pages";
    import uploadPicInput from "@/views/my-components/lili/upload-pic-input";

    export default {
        name: "pcNavigation",
        components: {
            uploadPicInput
        },
        data() {
            return {
                openTip: true, // 显示提示
                loading: true, // 表单加载状态
                type: "PC", // 手机还是pc
                modalType: 0, // 添加或编辑标识
                modalVisible: false, // 添加或编辑显示
                modalTitle: "", // 添加或编辑标题
                searchForm: { // 搜索框初始化对象
                    pageNumber: 1, // 当前页数
                    pageSize: 10, // 页面大小
                    sort: "createTime", // 默认排序字段
                    order: "desc", // 默认排序方式
                },
                form: { // 添加或编辑表单对象初始化数据
                    navigationName: "",
                    image: "",
                    url: "",
                },
                // 表单验证规则
                formValidate: {
                    url: [{required: true, message: "导航栏url不能为空", trigger: "blur"}],
                    navigationName: [{required: true, message: "导航栏不能为空", trigger: "blur"}],
                },
                submitLoading: false, // 添加或编辑提交状态
                selectList: [], // 多选数据
                selectCount: 0, // 多选计数
                columns: [
                    // 表头
                    {
                        type: "selection",
                        width: 60,
                        align: "center"
                    },
                    {
                        title: "导航名称",
                        key: "navigationName",
                        minWidth: 120,
                        sortable: false,
                    },
                    {
                        title: "状态",
                        key: "status",
                        minWidth: 100,
                        sortable: false,
                        render: (h, params) => {
                            if (params.row.status == 'CLOSE') {
                                return h("div", [
                                    h("Badge", {
                                        props: {
                                            status: "error",
                                            text: "禁用"
                                        }
                                    })
                                ]);
                            } else if (params.row.status == 'OPEN') {
                                return h("div", [
                                    h("Badge", {
                                        props: {
                                            status: "success",
                                            text: "启用"
                                        }
                                    })
                                ]);
                            }
                        }
                    },
                    {
                        title: "图片",
                        key: "image",
                        minWidth: 120,
                        sortable: false,
                        render: (h, params) => {
                            return h("img", {
                                attrs: {
                                    src: params.row.image,
                                    alt: "加载图片失败"
                                },
                                style: {
                                    cursor: "pointer",
                                    width: "80px",
                                    height: "60px",
                                    margin: "10px 0",
                                    "object-fit": "contain"
                                }
                            });
                        }
                    },
                    {
                        title: "排序",
                        key: "sort",
                        minWidth: 120,
                        sortable: false,
                    },
                    {
                        title: "操作",
                        key: "action",
                        align: "center",
                        width: 250,
                        render: (h, params) => {
                            console.warn(params.status)
                            let enableOrDisable = "";
                            if (params.row.status == "CLOSE") {
                                enableOrDisable = h(
                                    "Button",
                                    {
                                        props: {
                                            type: "success",
                                            size: "small"
                                        },
                                        style: {
                                            marginRight: "5px"
                                        },
                                        on: {
                                            click: () => {
                                                this.enable(params.row);
                                            }
                                        }
                                    },
                                    "启用"
                                );
                            } else {
                                enableOrDisable = h(
                                    "Button",
                                    {
                                        props: {
                                            size: "small"
                                        },
                                        style: {
                                            marginRight: "5px"
                                        },
                                        on: {
                                            click: () => {
                                                this.disable(params.row);
                                            }
                                        }
                                    },
                                    "禁用"
                                );
                            }
                            return h("div", [
                                h(
                                    "Button",
                                    {
                                        props: {
                                            type: "primary",
                                            size: "small"
                                        },
                                        style: {
                                            marginRight: "5px"
                                        },
                                        on: {
                                            click: () => {
                                                this.edit(params.row);
                                            }
                                        }
                                    },
                                    "编辑"
                                ),
                                h(
                                    "Button",
                                    {
                                        props: {
                                            type: "error",
                                            size: "small",
                                        },
                                        style: {
                                            marginRight: "5px"
                                        },
                                        on: {
                                            click: () => {
                                                this.del(params.row);
                                            }
                                        }
                                    },
                                    "删除"
                                ),
                                enableOrDisable,
                            ]);
                        }
                    }
                ],
                data: [], // 表单数据
                total: 0 // 表单数据总数
            };
        },
        methods: {
            init() {
                this.getDataList();
            },
            changePage(v) {
                this.searchForm.pageNumber = v;
                this.getDataList();
                this.clearSelectAll();
            },
            changePageSize(v) {
                this.searchForm.pageSize = v;
                this.getDataList();
            },
            handleSearch() {
                this.searchForm.pageNumber = 1;
                this.searchForm.pageSize = 10;
                this.getDataList();
            },
            handleReset() {
                this.$refs.searchForm.resetFields();
                this.searchForm.pageNumber = 1;
                this.searchForm.pageSize = 10;
                // 重新加载数据
                this.getDataList();
            },
            changeSort(e) {
                this.searchForm.sort = e.key;
                this.searchForm.order = e.order;
                if (e.order === "normal") {
                    this.searchForm.order = "";
                }
                this.getDataList();
            },
            clearSelectAll() {
                this.$refs.table.selectAll(false);
            },
            changeSelect(e) {
                this.selectList = e;
                this.selectCount = e.length;
            },
            getDataList() {
                this.searchForm.clientType = this.type
                this.loading = true;
                // 带多条件搜索参数获取表单数据 请自行修改接口
                getNavigationData(this.searchForm).then(res => {
                    this.loading = false;
                    if (res.success) {
                        this.data = res.result.records;
                        this.total = res.result.total;
                    }
                });
                this.total = this.data.length;
                this.loading = false;
            },
            handleSubmit() {
                this.$refs.form.validate(valid => {
                    if (valid) {
                        this.submitLoading = true;
                        this.form.clientType = this.type
                        if (this.modalType === 0) {
                            // 添加 避免编辑后传入id等数据 记得删除
                            delete this.form.id;
                            save(this.form).then(res => {
                                this.submitLoading = false;
                                if (res.success) {
                                    this.$Message.success("操作成功");
                                    this.getDataList();
                                    this.modalVisible = false;
                                }
                            });
                        } else {
                            // 编辑
                            update(this.form).then(res => {
                                this.submitLoading = false;
                                if (res.success) {
                                    this.$Message.success("操作成功");
                                    this.getDataList();
                                    this.modalVisible = false;
                                }
                            });
                        }
                    }
                });
            },
            add() {
                this.modalType = 0;
                this.modalTitle = "添加";
                this.$refs.form.resetFields();
                delete this.form.id;
                this.modalVisible = true;
            },
            edit(v) {
                this.modalType = 1;
                this.modalTitle = "编辑";
                this.$refs.form.resetFields();
                // 转换null为""
                for (let attr in v) {
                    if (v[attr] === null) {
                        v[attr] = "";
                    }
                }
                let str = JSON.stringify(v);
                let data = JSON.parse(str);
                this.form = data;
                this.modalVisible = true;
            },
            enable(v){
                this.$Modal.confirm({
                    title: "确认启用",
                    // 记得确认修改此处
                    content: "您确认要确认启用 " + v.navigationName + " ?",
                    loading: true,
                    onOk: () => {
                        // 删除
                        enableNavigation(v.id).then(res => {
                            this.$Modal.remove();
                            if (res.success) {
                                this.$Message.success("操作成功");
                                this.getDataList();
                            }
                        });
                    }
                });
            },
            disable(v) {
                this.$Modal.confirm({
                    title: "确认禁用",
                    // 记得确认修改此处
                    content: "您确认要禁用 " + v.navigationName + " ?",
                    loading: true,
                    onOk: () => {
                        // 删除
                        disableNavigation(v.id).then(res => {
                            this.$Modal.remove();
                            if (res.success) {
                                this.$Message.success("操作成功");
                                this.getDataList();
                            }
                        });
                    }
                });
            },
            disableAll() {
                if (this.selectCount <= 0) {
                    this.$Message.warning("您还未选择要禁用的数据");
                    return;
                }
                this.$Modal.confirm({
                    title: "确认禁用",
                    content: "您确认要禁用所选的 " + this.selectCount + " 条数据?",
                    loading: true,
                    onOk: () => {
                        let ids = "";
                        this.selectList.forEach(function (e) {
                            ids += e.id + ",";
                        });
                        ids = ids.substring(0, ids.length - 1);
                        // 批量禁用
                        disableNavigation(ids).then(res => {
                            this.$Modal.remove();
                            if (res.success) {
                                this.$Message.success("操作成功");
                                this.clearSelectAll();
                                this.getDataList();
                            }
                        });
                    }
                });
            },
            del(v) {
                this.$Modal.confirm({
                    title: "确认删除",
                    // 记得确认修改此处
                    content: "您确认要永久性删除 " + v.navigationName + " ?",
                    loading: true,
                    onOk: () => {
                        // 删除
                        delNavigation(v.id).then(res => {
                            this.$Modal.remove();
                            if (res.success) {
                                this.$Message.success("操作成功");
                                this.getDataList();
                            }
                        });
                    }
                });
            }
        },

        mounted() {
            this.init();
        }
    };
</script>
<style lang="scss">
    // 建议引入通用样式 可删除下面样式代码
    // @import "@/styles/table-common.scss";
    .search {
        .operation {
            margin-bottom: 2vh;
        }
        .select-count {
            font-weight: 600;
            color: #40a9ff;
        }
        .select-clear {
            margin-left: 10px;
        }
        .page {
            margin-top: 2vh;
        }
        .drop-down {
            margin-left: 5px;
        }
    }
</style>
