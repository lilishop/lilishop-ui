<template>
  <div class="template">
    <BaseHeader></BaseHeader>
    <div class="wrapper">
      <!--面包屑-->
      <Breadcrumb class="mb_20" separator=">">
        <BreadcrumbItem  to="/">首页</BreadcrumbItem>
        <BreadcrumbItem  to="/allCategories">全部分类</BreadcrumbItem>
      </Breadcrumb>

      <Tabs :animated="false">
        <TabPane class="mt_40"  v-for="(item,index) in mockData" :key="index" :label="item.title">
          <!-- 分类详情-->
          <div class="cateBox">
            <div class="width_800  cateContent" ref="cateContent">
              <div v-for="(data,i) in item.data" :key="i" class="cateList mb_40">
                <div class="cateListTitle">
                  <p class="mb_40">{{data.title}} </p>
                  <div class="cateList">
                    <div v-for="(cate,j) in data.List" :key="j" class="cateItem">{{cate.content}}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </TabPane>
      </Tabs>
    </div>
    <BaseFooter></BaseFooter>
  </div>
</template>


<script>
export default {
  name: "AllCategories",
  data() {
    return {
      mockData: [
        {
          title: "图书、电子书",
          data: [
            {
              title: "电子书",
              List: [
                {
                  content: "小说"
                },
                {
                  content: "经典"
                },
                {
                  content: "古装"
                }
              ]
            },
            {
              title: "畅销书",
              List: [
                {
                  content: "小说畅销"
                },
                {
                  content: "经典畅销"
                },
                {
                  content: "古装畅销"
                }
              ]
            }
          ]
        },
        {
          title: "大牌儿2",
          data: [
            {
              title: "电子书2",
              List: [
                {
                  content: "小说2"
                },
                {
                  content: "经典2"
                },
                {
                  content: "古装2"
                }
              ]
            },
            {
              title: "畅销书2",
              List: [
                {
                  content: "小说畅销2"
                },
                {
                  content: "经典畅销2"
                },
                {
                  content: "古装畅销2"
                }
              ]
            }
          ]
        },
        {
          title: "大牌儿3",
          data: [
            {
              title: "电子书3",
              List: [
                {
                  content: "小说3"
                },
                {
                  content: "经典3"
                },
                {
                  content: "古装3"
                }
              ]
            },
            {
              title: "畅销书3",
              List: [
                {
                  content: "小说畅销3"
                },
                {
                  content: "经典畅销3"
                },
                {
                  content: "古装畅销3"
                }
              ]
            }
          ]
        },
        {
          title: "大牌儿",
          data: [
            {
              title: "电子书",
              List: [
                {
                  content: "小说"
                },
                {
                  content: "经典"
                },
                {
                  content: "古装"
                }
              ]
            },
            {
              title: "畅销书",
              List: [
                {
                  content: "小说畅销"
                },
                {
                  content: "经典畅销"
                },
                {
                  content: "古装畅销"
                }
              ]
            }
          ]
        },
        {
          title: "大牌儿",
          data: [
            {
              title: "电子书",
              List: [
                {
                  content: "小说"
                },
                {
                  content: "经典"
                },
                {
                  content: "古装"
                }
              ]
            },
            {
              title: "畅销书",
              List: [
                {
                  content: "小说畅销"
                },
                {
                  content: "经典畅销"
                },
                {
                  content: "古装畅销"
                }
              ]
            }
          ]
        },
        {
          title: "大牌儿",
          data: [
            {
              title: "电子书",
              List: [
                {
                  content: "小说"
                },
                {
                  content: "经典"
                },
                {
                  content: "古装"
                }
              ]
            },
            {
              title: "畅销书",
              List: [
                {
                  content: "小说畅销"
                },
                {
                  content: "经典畅销"
                },
                {
                  content: "古装畅销"
                }
              ]
            }
          ]
        }
      ]
    };
  },
  created() {
    this.windowScroll();
  },
  methods: {
    // 获取每个tab的数据
    // filterCate(){

    // },

    windowScroll() {
      let cateWay = [];
      for (
        let i = 0;
        i < document.getElementsByClassName("cateTitle").length;
        i++
      ) {
        let cate = document.getElementsByClassName("cateTitle")[i];
        cateWay.push(cate.offsetTop);
      }

      console.log(cateWay);

      window.onscroll = function() {
        var scrollTop =
          document.documentElement.scrollTop || document.body.scrollTop;
        console.log("滚动距离" + scrollTop);
      };
    }
  }
};
</script>

<style lang="scss" scoped>
.template {
  width: 100%;
  @include background_color($light_background_color);
}

.wrapper {
  width: 1200px;
  padding-top: 30px;
  margin: 0 auto;
}

.cateContent {
  overflow: hidden;
}

.cateBox {
  
  min-height: 600px;
}

.cateTitle {
  background: $theme_color;
  height: 50px;
  line-height: 50px;
  text-align: center;
  color: #fff;
  font-size: 18px;
}

.cateMenuItem {
  @include title_color($light_title_color);
  padding: 8px 0;
  font-weight: 400 !important;
}

.cateListTitle {
  > p {
    font-size: 14px;
    font-weight: bold;
    @include title_color($light_title_color);
  }
}

.cateList {
  display: flex;
}
.cateItem {
  
  cursor: pointer;
  display: block;
  width: 137px;
  height: 38px;
  @include background_color($light_background_color);
  @include content_color($light_title_color);
  border: 1px dashed $border_color;
  line-height: 38px;
  text-align: center;
  margin-right: -1px;
  margin-bottom: -1px;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
  transition: all 0.2s ease-in;
}
.cateItem:hover{
  background: $theme_color;
  color: #fff;
}
.mt_40{
  margin-top: 40px;
}
.mb_40{
  margin-bottom: 40px;
}
</style>
