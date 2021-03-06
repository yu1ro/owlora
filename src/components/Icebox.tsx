import * as React from 'react';
import {Component} from 'react';
import * as _ from 'lodash';
import {Card, Dimmer, Icon, Label, Segment, Statistic} from 'semantic-ui-react';
import Task, {TaskUpdateParameter} from '../models/Task';
import TaskSortField from '../constants/TaskSortField';
import Order from '../constants/Order';
import {DragSource, DropTarget} from 'react-dnd';
import {findDOMNode} from 'react-dom';
import {TaskFeeds} from "./TaskFeeds";
import ImageOrEmoji from './ImageOrEmoji';


export interface IceboxProps {
    tasks: Task[];
    taskSortField: TaskSortField;
    taskOrder: Order;
    width: number;

    connectDropTarget?: Function;
    isOver?: boolean;
    canDrop?: boolean;

    onUpdateTask: (parameter: TaskUpdateParameter) => void;
}

@DropTarget(
    'task-feed',
    {
        drop(props: IceboxProps, monitor, component) {
            if (monitor.didDrop()) {
                return;
            }

            return {
                date: '',
                dateString: ''
            };
        },

        canDrop(props: IceboxProps, monitor) {
            return !_.includes(props.tasks.map(x => x.id), monitor.getItem().id)
        }
    },
    (connect, monitor) => ({
        connectDropTarget: connect.dropTarget(),
        isOver: monitor.isOver(),
        canDrop: monitor.canDrop(),
    })
)
export default class extends Component<IceboxProps> {
    render() {
        const estimatedTasks: Task[] = _(this.props.tasks)
            .reject(t => t.isMilestone)
            .value();

        return (
            <Card ref={node => this.props.connectDropTarget(findDOMNode(this))} style={{width: this.props.width}}>
                <Dimmer active={!this.props.canDrop && this.props.isOver}
                        style={{backgroundColor: "grey", opacity: 0.5}}
                        content=""/>
                <Dimmer active={this.props.canDrop && this.props.isOver}
                        style={{backgroundColor: "red", opacity: 0.5}}
                        content={
                            <div>
                                <h2>Remove duedate</h2>
                                <Icon name='arrow circle outline down' size='huge'/>
                            </div>
                        }/>
                <Segment inverted style={{margin: 0}}>
                    <Icon name="inbox" size="big" color="teal"/>
                    <Statistic size='mini' color="teal" inverted="true">
                        <Statistic.Value>ICEBOX</Statistic.Value>
                    </Statistic>
                </Segment>
                <Card.Content>
                    <TaskFeeds tasks={estimatedTasks}
                               taskSortField={this.props.taskSortField}
                               taskOrder={this.props.taskOrder}
                               onUpdateTask={this.props.onUpdateTask}/>
                </Card.Content>
                <Card.Content extra>
                    {
                        _(estimatedTasks)
                            .groupBy(t => t.icon)
                            .map((tasks: Task[]) => ({
                                icon: tasks[0].icon,
                                minutes: _.sumBy(tasks, t => t.estimatedMinutes)
                            }))
                            .orderBy(x => x.minutes, 'desc')
                            .map(x => (
                                <span key={x.icon} style={{marginRight: 10}}>
                                    <ImageOrEmoji src={x.icon}/>
                                    <Label color='teal' circular>{x.minutes}</Label>
                                </span>
                            ))
                            .value()
                    }
                </Card.Content>
            </Card>
        );
    }
};
