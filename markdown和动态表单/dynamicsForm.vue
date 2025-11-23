<template>
    <el-form ref="elFormRef" :model="formModel" :rules="formRules" label-width="100px">
      <el-row :gutter="20">
        <el-col
          v-for="item in fieldMeta"
          :key="item.field"
          v-bind="item.colProps || { span: 24 }"
        >
          <el-form-item :label="item.label" :prop="item.field">
            <!-- 自定义插槽优先渲染 -->
            <slot v-if="item.slot" :name="item.slot" :model="formModel" />
            <!-- 动态渲染内置组件 -->
            <component
              v-else
              :is="getComponent(item)"
              v-model="formModel[item.field]"
              v-bind="item.componentProps"
            />
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
  </template>
  
  <script lang="ts">
  import { defineComponent, ref, reactive, PropType } from 'vue';
  import { ElForm, ElFormItem, ElRow, ElCol } from 'element-plus';
  
  export default defineComponent({
    props: {
    //   schemas: {
    //     type: Array as PropType<FormSchema[]>,
    //     required: true,
    //   },
    },
    setup(props) {
    
        type ComponentType = 'Input' | 'Select' | 'DatePicker' | 'Custom'; 

       interface FormSchema {
        field: string; // 字段名（如 `name`）
        label: string; // 表单标签（如 `姓名`）
        component: ComponentType; // 组件类型（对应 Element Plus 组件）
        colProps?: Record<string, any>; // 栅格列属性（如 `span: 12`）
        componentProps?: Record<string, any>; // 组件绑定属性（如 `placeholder`）
        options?: { label: string; value: any }[]; // 下拉选项（用于 Select）
        required?: boolean; // 是否必填
        rules?: any[]; // 校验规则（如 `required`、`minLength`）
        slot?: string; // 自定义插槽名称
        }

     
    // 假设后端返回字段元数据
    const fieldMeta = reactive([
    { field: 'name', label: '姓名', required: true, minLength: 2, maxLength: 10, component:'Input', },
    { field: 'age', label: '年龄', required: true, type: 'number', min: 18, max: 60,component:'Input', },
    { field: 'phone', label: '手机号', required: true,component:'Input', },
    ]);



      // 1. 响应式表单模型（自动从配置生成）
      const formModel = reactive(
        fieldMeta.reduce((model, schema) => {
        //   model[schema.name] = schema.componentProps?.value || '';
          model[schema.field] = '';
          return model;
        }, {} as Record<string, any>)
      );
  



    function validatePhone(rule, value,callback) {
      const reg =/^[1][3,4,5,7,8][0-9]{9}$/;
      if(value==''||value==undefined||value==null){
        callback();
      }else {
        if ((!reg.test(value)) && value != '') {
          callback(new Error('请输入正确的电话号码'));
        } else {
          callback();
        }
      }
    }

    // 动态生成规则
    const formRules = fieldMeta.reduce((acc, meta) => {
    acc[meta.field] = [];
    if (meta.required) {
        acc[meta.field].push({ required: true, message: `${meta.label} 不能为空`, trigger: 'blur' });
    }
    if (meta.minLength) {
        acc[meta.field].push({ min: meta.minLength, message: `${meta.label} 长度至少 ${meta.minLength} 位`, trigger: 'blur' });
    }
    if (meta.maxLength) {
        acc[meta.field].push({ max: meta.maxLength, message: `${meta.label} 长度最多 ${meta.maxLength} 位`, trigger: 'blur' });
    }
    if (meta.type === 'number') {
        acc[meta.field].push({ type: 'number', message: `${meta.label} 必须为数字`, trigger: 'blur' });
    }
    if (meta.field === 'phone') {
        acc[meta.field].push({validator: validatePhone, trigger: 'blur' });
    }
    return acc;
    }, {} as Record<string, any[]>);
  
      // 3. 动态渲染组件（根据 component 字段匹配 Element Plus 组件）
      const getComponent = (schema: FormSchema) => {
        switch (schema.component) {
          case 'Input':
            return 'el-input';
          case 'Select':
            return 'el-select';
          case 'DatePicker':
            return 'el-date-picker';
          case 'Custom':
            return 'custom-component'; // 自定义组件需提前注册
          default:
            return 'el-input';
        }
      };
  
      return {
        fieldMeta,
        formModel,
        formRules,
        getComponent,
      };
    },
  });
</script>