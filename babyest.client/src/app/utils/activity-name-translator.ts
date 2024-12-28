export class ActivityNameTranslator {
    constructor() { }
    changeCurrentActivityNameUA(newActivity : string) : string {
        switch(newActivity.toLowerCase()) {
          case ('sleeping') : {
            return 'Сон';
          }
          case ('') : {
            return 'Чіл';
          }
          default : {
            return 'Їда';
          }
        }
      }

      changeCurrentActivityFullNameUA(newActivity : string) : string {
        switch(newActivity.toLowerCase()) {
            case ('sleeping') : {
              return 'Сон';
            }
            case ('eatingleft') : {
              return 'Годування Ліва';
            }
            case ('eatingright') : {
                return 'Годування Права';
            }
            case ('eatingbottle') : {
                return 'Годування Пляшечка';
            }
            case ('eatingboth') : {
                return 'Годування Обидві';
            }
            default : {
                return 'Чіл';
            }
          }
      }
}
