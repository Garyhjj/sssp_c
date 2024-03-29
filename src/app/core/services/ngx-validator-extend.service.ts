/**
 * angular验证器扩展服务
 * version: '0.03'
 * name: 'ngValidatorExtend.js'
 * author: 'gary.h'
 * 2017-08-1
 */
import { Injectable } from '@angular/core';
import { ValidatorFn } from '@angular/forms';
import { AbstractControl } from '@angular/forms';

@Injectable()
export class NgxValidatorExtendService {
  constructor() { }

  /**
   * 必须填
   * @return {ValidatorFn} [验证器]
   */
  required(): ValidatorFn | any {
    return (ctrl: AbstractControl) => {
      const value = ctrl.value;
      return value || value === 0
        ? null
        : {
          required: true,
        };
    };
  }

  isNull(): ValidatorFn | any {
    return (ctrl: AbstractControl) => {
      const value = ctrl.value;
      return !(value || value === 0)
        ? null
        : {
          null: true,
        };
    };
  }

  /**
   * 字符串最小长度
   * @param  {number}   num 传入的长度要求
   * @return {ValidatorFn}     验证器
   */
  minLength(num: number): ValidatorFn {
    return (ctrl: AbstractControl) => {
      let value = ctrl.value;
      if (value === void 0 || value === null) {
        return null;
      }
      value = value + '';
      const valueL = value.length;
      return !value || valueL >= num
        ? null
        : {
          minlength: {
            requiredLength: num,
            actualLength: valueL,
          },
        };
    };
  }

  /**
   * 字符串最大长度
   * @param  {number}   num 传入的长度要求
   * @return {ValidatorFn}     验证器
   */
  maxLength(num: number): ValidatorFn {
    return (ctrl: AbstractControl) => {
      let value = ctrl.value;
      if (value === void 0 || value === null) {
        return null;
      }
      value = value + '';
      const valueL = value.length;
      return !value || valueL <= num
        ? null
        : {
          maxlength: {
            requiredLength: num,
            actualLength: valueL,
          },
        };
    };
  }

  /**
   * 限制最大数值
   * @param  {number}   num 传入的长度要求
   * @return {ValidatorFn}     验证器
   */
  max(num: number): ValidatorFn {
    return (ctrl: AbstractControl) => {
      const value = Number(ctrl.value);
      return !value || value <= num
        ? null
        : {
          max: {
            requiredValue: num,
            actualValue: value,
          },
        };
    };
  }

  /**
   * 限制最小数值
   * @param  {number}   num 传入的长度要求
   * @return {ValidatorFn}     验证器
   */
  min(num: number): ValidatorFn {
    return (ctrl: AbstractControl) => {
      const value = Number(ctrl.value);
      return !value || value >= num
        ? null
        : {
          min: {
            requiredValue: num,
            actualValue: value,
          },
        };
    };
  }

  /**
   * 限制字符串长度的范围
   * @param  {number[]} bet 长度为2的数组、例‘[2,6]’
   * @return {ValidatorFn}     验证器
   */
  betweenLength(bet: number[]): ValidatorFn {
    if (bet instanceof Array && bet.length > 1) {
      return (ctrl: AbstractControl) => {
        const value = ctrl.value;
        if (!value) {
          return null;
        }
        const valueL = value.length;
        return !value || (valueL >= bet[0] && valueL <= bet[1])
          ? null
          : {
            betweenLength: {
              requiredLength: bet[0] + '-' + bet[1],
              actualLength: valueL,
            },
          };
      };
    } else {
      throw new Error('参数必须是数组类型,并且长度不能小于1');
    }
  }

  /**
   * 根据输入的正则验证
   * @param  {any}    reg   正则表达式
   * @return {ValidatorFn}     验证器
   */
  regex(reg: any): ValidatorFn {
    return (ctrl: AbstractControl) => {
      const value = ctrl.value;
      const regx = new RegExp(reg);
      return regx.test(value)
        ? null
        : {
          RegExp: regx.toString(),
        };
    };
  }

  /**
   * 检测是否为邮箱
   * @return {ValidatorFn} 验证器
   */
  email(): ValidatorFn {
    return (ctrl: AbstractControl) => {
      const value = ctrl.value;
      if (!value) {
        return null;
      }
      return !value ||
        /^([a-zA-Z0-9_-])+(.[a-zA-Z0-9_-]*)*\@([a-zA-Z0-9_-])+(.[a-zA-Z0-9_-])+(.[a-zA-Z0-9_-])*/.test(
          value,
        )
        ? null
        : {
          email: true,
        };
    };
  }

  /**
   * 长度限制
   * @param  {number}   length 字符长度
   * @return {ValidatorFn}        验证器
   */
  length(length: number): ValidatorFn {
    return (ctrl: AbstractControl) => {
      const value = ctrl.value;
      if (!value) {
        return null;
      }
      const valueL = value.length;
      return !value || valueL === Number(length)
        ? null
        : {
          length: {
            requiredLength: Number(length),
            actualLength: valueL,
          },
        };
    };
  }

  /**
   * 限制数值最大最小值
   * @param  {number[]} bet 大小范围
   * @return {ValidatorFn}     验证器
   */
  between(bet: number[]): ValidatorFn {
    if (bet instanceof Array && bet.length > 1) {
      return (ctrl: AbstractControl) => {
        const value = Number(ctrl.value);
        return !value || (value >= bet[0] && value <= bet[1])
          ? null
          : {
            between: {
              requiredValue: bet[0] + '-' + bet[1],
              actualValue: value,
            },
          };
      };
    } else {
      throw new Error('参数必须是数组类型,并且长度不能小于1');
    }
  }

  /**
   * 为整数
   * @return {ValidatorFn} 验证器
   */
  integer(): ValidatorFn {
    return (ctrl: AbstractControl) => {
      const value = ctrl.value;
      if (!value) {
        return null;
      }
      return !value || /^\-?\d+$/.test(value)
        ? null
        : {
          integer: true,
        };
    };
  }

  /**
   * 为数字
   * @return {ValidatorFn} 验证器
   */
  number(): ValidatorFn {
    return (ctrl: AbstractControl) => {
      const value = ctrl.value;
      if (!value) {
        return null;
      }
      return !value || !isNaN(Number(value))
        ? null
        : {
          number: true,
        };
    };
  }

  /**
   * 为移动号码
   * @return {ValidatorFn} 验证器
   */
  mobile(): ValidatorFn {
    return (ctrl: AbstractControl) => {
      const value = ctrl.value;
      if (!value) {
        return null;
      }
      return !value || /^1\d{10}$/.test(value)
        ? null
        : {
          mobile: true,
        };
    };
  }

  /**
   * 为固话号码
   * @return {ValidatorFn} 验证器
   */
  telephone(): ValidatorFn {
    return (ctrl: AbstractControl) => {
      const value = ctrl.value;
      if (!value) {
        return null;
      }
      return !value || /^\d{4}\-\d{8}$/.test(value)
        ? null
        : {
          telephone: true,
        };
    };
  }

  /**
   * 为网址
   * @return {ValidatorFn} 验证器
   */
  url(): ValidatorFn {
    return (ctrl: AbstractControl) => {
      const value = ctrl.value;
      if (!value) {
        return null;
      }
      return !value ||
        /(((^https?:(?:\/\/)?)(?:[-;:&=\+\$,\w]+@)?[A-Za-z0-9.-]+|(?:www.|[-;:&=\+\$,\w]+@)[A-Za-z0-9.-]+)((?:\/[\+~%\/.\w-_]*)?\??(?:[-\+=&;%@.\w_]*)#?(?:[\w]*))?)$/g.test(
          value,
        )
        ? null
        : {
          url: true,
        };
    };
  }

  /**
   * 与同级栏位进行内容对比，是否相等
   * @param  {string}   name 同级栏位名称
   * @return {ValidatorFn}      验证器
   */
  equalTo(name: string): ValidatorFn {
    return (ctrl: AbstractControl) => {
      const value = ctrl.value;
      if (!ctrl.parent) {
        return null;
      }
      if (!ctrl.parent.controls[name]) {
        throw new Error('同级栏位中没有' + name + '栏位');
      }
      const anotherVal = ctrl.parent.controls[name].value || null;
      return anotherVal && value === anotherVal
        ? null
        : {
          equalTo: {
            target: name,
          },
        };
    };
  }

  /**
   * 与同级栏位进行日期比对，比另一个栏位要大
   * @param  {string}   name 同级栏位名称
   * @return {ValidatorFn}      验证器
   */
  dateBigger(name: string): ValidatorFn {
    return (ctrl: AbstractControl) => {
      const value = ctrl.value;
      if (!ctrl.parent) {
        return null;
      }
      if (!ctrl.parent.controls[name]) {
        throw new Error('同级栏位中没有' + name + '栏位');
      }
      const anotherControl: AbstractControl = ctrl.parent.controls[name];
      const anotherVal = anotherControl.value || null;
      if (anotherVal) {
        if (new Date(value).getTime() - new Date(anotherVal).getTime() > 0) {
          setTimeout(() => {
            if (anotherControl.invalid) {
              anotherControl.setValue(anotherVal);
            }
          }, 100);
          return null;
        } else {
          return {
            dateBigger: {
              target: name,
            },
          };
        }
      } else {
        return null;
      }
    };
  }

  /**
 * 与同级栏位进行日期比对，比另一个栏位要小
 * @param  {string}   name 同级栏位名称
 * @return {ValidatorFn}      验证器
 */
  dateSmall(name: string): ValidatorFn {
    return (ctrl: AbstractControl) => {
      const value = ctrl.value;
      if (!ctrl.parent) {
        return null;
      }
      if (!ctrl.parent.controls[name]) {
        throw new Error('同级栏位中没有' + name + '栏位');
      }
      const anotherControl: AbstractControl = ctrl.parent.controls[name];
      const anotherVal = anotherControl.value || null;
      if (anotherVal) {
        if (new Date(value).getTime() - new Date(anotherVal).getTime() < 0) {
          setTimeout(() => {
            if (anotherControl.invalid) {
              anotherControl.setValue(anotherVal);
            }
          }, 100);
          return null;
        } else {
          return {
            dateSmall: {
              target: name,
            },
          };
        }
      } else {
        return null;
      }
    };
  }

  /**
   * 与同级栏位进行數值比对，比另一个栏位要小
   * @param  {string}   name 同级栏位名称
   * @return {ValidatorFn}      验证器
   */
  numberSmaller(name: string): ValidatorFn {
    return (ctrl: AbstractControl) => {
      const value = ctrl.value;
      if (!ctrl.parent) {
        return null;
      }
      if (!ctrl.parent.controls[name]) {
        throw new Error('同级栏位中没有' + name + '栏位');
      }
      const anotherControl: AbstractControl = ctrl.parent.controls[name];
      const anotherVal = anotherControl.value || null;
      if (anotherVal) {
        if (value - anotherVal <= 0) {
          setTimeout(() => {
            if (anotherControl.invalid) {
              anotherControl.setValue(anotherVal);
            }
          }, 100);
          return null;
        } else {
          return {
            numberSmaller: {
              target: name,
            },
          };
        }
      } else {
        return null;
      }
    };
  }

  numberBigger(name: string): ValidatorFn {
    return (ctrl: AbstractControl) => {
      const value = ctrl.value;
      if (!ctrl.parent) {
        return null;
      }
      if (!ctrl.parent.controls[name]) {
        throw new Error('同级栏位中没有' + name + '栏位');
      }
      const anotherControl: AbstractControl = ctrl.parent.controls[name];
      const anotherVal = anotherControl.value || null;
      if (anotherVal) {
        if (value - anotherVal >= 0) {
          setTimeout(() => {
            if (anotherControl.invalid) {
              anotherControl.setValue(anotherVal);
            }
          }, 100);
          return null;
        } else {
          return {
            numberBigger: {
              target: name,
            },
          };
        }
      } else {
        return null;
      }
    };
  }

  /**
   * 检查小数位的个数
   * @param  {number} num   小数位的个数
   * @return {ValidatorFn}     验证器
   */
  toFix(num: number): ValidatorFn {
    return (ctrl: AbstractControl) => {
      const value = ctrl.value;
      if (!value) {
        return null;
      }
      const reg = '^([\\d]+)(\\.[\\d]{' + Number(num) + '})?$';
      return new RegExp(reg).test(value)
        ? null
        : {
          toFix: true,
        };
    };
  }

  jsonString(): ValidatorFn {
    return (ctrl: AbstractControl) => {
      const value = ctrl.value;
      if (!value) {
        return null;
      }
      try {
        JSON.parse(value);
      } catch (e) {
        return {
          jsonString: true,
        };
      }
      return null;
    };
  }

  /**
   * 自定位验证规则, fn(ctrl,opt)
   * @param  {any} fn  自定义的规则函数，参数（ctrl,opt）
   * @param  {any}      opt 自定义参数
   * @return {ValidatorFn}     验证器
   */
  selfDefine(fn: any, opt?: any): ValidatorFn | any {
    return (ctrl: AbstractControl) => {
      return fn.call(this, ctrl, opt);
    };
  }
}
